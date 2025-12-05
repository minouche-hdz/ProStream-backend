import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

// Assurez-vous que ffmpeg et ffprobe sont disponibles dans le PATH de l'environnement d'exécution.
// Dans un conteneur Docker Alpine, ils sont généralement dans le PATH par défaut après installation.
// Si vous exécutez localement, assurez-vous que les chemins sont corrects pour votre système.
// ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg'); // Exemple pour macOS avec Homebrew
// ffmpeg.setFfprobePath('/opt/homebrew/bin/ffprobe'); // Exemple pour macOS avec Homebrew

@Injectable()
export class StreamingService implements OnModuleDestroy {
  private readonly logger = new Logger(StreamingService.name);
  private readonly HLS_TEMP_DIR = '/app/hls_temp'; // Répertoire temporaire dans le conteneur
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Nettoyage toutes les 5 minutes
  private readonly SESSION_TIMEOUT_MS = 60 * 60 * 1000; // Une session expire après 1 heure d'inactivité
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Assurez-vous que le répertoire temporaire existe
    if (!fs.existsSync(this.HLS_TEMP_DIR)) {
      fs.mkdirSync(this.HLS_TEMP_DIR, { recursive: true });
    }
    this.startCleanupTimer();
  }

  onModuleDestroy() {
    this.stopCleanupTimer();
    this.cleanupAllSessions(); // Nettoyer toutes les sessions à l'arrêt de l'application
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.logger.log('Exécution du nettoyage des sessions HLS inactives...');
      this.cleanupInactiveSessions();
    }, this.CLEANUP_INTERVAL_MS);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    fs.readdir(this.HLS_TEMP_DIR, { withFileTypes: true }, (err, entries) => {
      if (err) {
        this.logger.error(
          `Erreur lors de la lecture du répertoire temporaire HLS: ${err.message}`,
        );
        return;
      }

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const sessionDir = path.join(this.HLS_TEMP_DIR, entry.name);
          try {
            const stats = fs.statSync(sessionDir);
            // Supprimer si le répertoire n'a pas été modifié depuis SESSION_TIMEOUT_MS
            if (now - stats.mtimeMs > this.SESSION_TIMEOUT_MS) {
              this.cleanupSession(entry.name);
            }
          } catch (statErr) {
            this.logger.warn(
              `Impossible de statuer le répertoire ${sessionDir}: ${statErr.message}`,
            );
          }
        }
      }
    });
  }

  private cleanupAllSessions(): void {
    this.logger.log(
      "Nettoyage de toutes les sessions HLS à l'arrêt de l'application.",
    );
    fs.readdir(this.HLS_TEMP_DIR, { withFileTypes: true }, (err, entries) => {
      if (err) {
        this.logger.error(
          `Erreur lors de la lecture du répertoire temporaire HLS pour le nettoyage global: ${err.message}`,
        );
        return;
      }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          this.cleanupSession(entry.name);
        }
      }
    });
  }

  private async probeStream(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) {
          return reject(new Error(`FFprobe error: ${err.message}`));
        }
        resolve(metadata);
      });
    });
  }

  async startHlsStream(mkvUrl: string, startTime?: number): Promise<string> {
    this.logger.log(
      `Démarrage de la préparation HLS pour l'URL : ${mkvUrl} (start: ${startTime || 0}s)`,
    );

    const { v4: uuidv4 } = await import('uuid');
    const sessionId = uuidv4();
    const sessionDir = path.join(this.HLS_TEMP_DIR, sessionId);
    const masterPlaylistPath = path.join(sessionDir, 'master.m3u8');

    try {
      // Créer le répertoire de session
      fs.mkdirSync(sessionDir, { recursive: true });

      const metadata = await this.probeStream(mkvUrl);
      const videoStream = metadata.streams.find(
        (s) => s.codec_type === 'video',
      );
      const audioStreams = metadata.streams.filter(
        (s) => s.codec_type === 'audio',
      );

      if (!videoStream) {
        throw new Error('Aucune piste vidéo trouvée dans le fichier MKV.');
      }

      this.logger.log(
        `Piste vidéo trouvée: ${videoStream.codec_name}, ${videoStream.width}x${videoStream.height}, bitrate: ${videoStream.bit_rate || 'N/A'}`,
      );
      this.logger.log(
        `Nombre de pistes audio trouvées: ${audioStreams.length}`,
      );

      const videoDir = path.join(sessionDir, 'video');
      fs.mkdirSync(videoDir, { recursive: true });
      const videoPlaylistName = 'video.m3u8';
      const videoSegmentPath = path.join(videoDir, 'segment%03d.m4s');
      const videoPlaylistPath = path.join(videoDir, videoPlaylistName);

      // 1. Démarrer la conversion vidéo en arrière-plan
      this.startVideoConversion(
        mkvUrl,
        videoStream.index,
        videoPlaylistPath,
        videoSegmentPath,
        sessionId,
        startTime,
      );

      // 2. Démarrer la conversion audio en arrière-plan
      const audioPlaylistPaths: { lang: string; path: string }[] = [];
      for (const [index, audio] of audioStreams.entries()) {
        const audioDir = path.join(sessionDir, `audio_${index}`);
        fs.mkdirSync(audioDir, { recursive: true });
        const audioPlaylistName = `audio_${audio.tags?.language || `und`}_${index}.m3u8`;
        const audioSegmentPath = path.join(audioDir, 'segment%03d.m4s');
        const audioPlaylistPath = path.join(audioDir, audioPlaylistName);

        this.startAudioConversion(
          mkvUrl,
          audio.index,
          audioPlaylistPath,
          audioSegmentPath,
          sessionId,
          index,
          startTime,
        );

        audioPlaylistPaths.push({
          lang: audio.tags?.language || `und`,
          path: `audio_${index}/${audioPlaylistName}`,
        });
      }

      // 3. Attendre que les fichiers playlists soient créés (timeout 60s)
      this.logger.log('Attente de la création des fichiers playlists...');
      await this.waitForFile(videoPlaylistPath, 60000);
      for (const audio of audioPlaylistPaths) {
        const fullAudioPath = path.join(sessionDir, audio.path);
        await this.waitForFile(fullAudioPath, 60000);
      }

      // 4. Créer le master playlist manuellement
      let masterPlaylistContent = '#EXTM3U\n#EXT-X-VERSION:6\n';

      // Ajouter les pistes audio d'abord (pour la référence)
      audioPlaylistPaths.forEach((audio, index) => {
        masterPlaylistContent += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="${audio.lang}",DEFAULT=${index === 0 ? 'YES' : 'NO'},AUTOSELECT=YES,LANGUAGE="${audio.lang}",URI="${audio.path}"\n`;
      });

      // Ajouter la piste vidéo avec référence au groupe audio
      masterPlaylistContent += `#EXT-X-STREAM-INF:BANDWIDTH=${
        videoStream.bit_rate || 1000000
      },RESOLUTION=${videoStream.width}x${videoStream.height},CODECS="avc1.64001f,mp4a.40.2"${audioPlaylistPaths.length > 0 ? ',AUDIO="audio"' : ''}\n`;
      masterPlaylistContent += `video/${videoPlaylistName}\n`;

      fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);
      this.logger.log(`Master playlist créé pour la session ${sessionId}.`);

      return sessionId;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la préparation du streaming HLS pour l'URL ${mkvUrl}: ${error.message}`,
      );
      this.cleanupSession(sessionId); // Nettoyer en cas d'erreur
      throw error;
    }
  }

  private startVideoConversion(
    mkvUrl: string,
    streamIndex: number,
    playlistPath: string,
    segmentPath: string,
    sessionId: string,
    startTime?: number,
  ) {
    const ffmpegCommand = ffmpeg(mkvUrl);

    if (startTime) {
      ffmpegCommand.seekInput(startTime);
    }

    ffmpegCommand
      .outputOptions([
        '-map',
        `0:${streamIndex}`,
        '-c:v',
        'copy', // Copier la vidéo sans ré-encodage
        '-f',
        'hls',
        '-hls_time',
        '10',
        '-hls_list_size',
        '0',
        '-hls_segment_type',
        'fmp4',
        '-hls_flags',
        'independent_segments',
        '-hls_playlist_type',
        'event',
        '-hls_segment_filename',
        segmentPath,
      ])
      .output(playlistPath)
      .on('start', (commandLine) => {
        this.logger.log(`FFmpeg vidéo démarré : ${commandLine}`);
      })
      .on('error', (err, stdout, stderr) => {
        // Ignorer l'erreur si la session a déjà été nettoyée (ex: arrêt manuel)
        if (!fs.existsSync(path.dirname(playlistPath))) return;

        this.logger.error(
          `Erreur FFmpeg vidéo pour ${sessionId}: ${err.message}`,
        );
        this.logger.error(`FFmpeg stdout: ${stdout}`);
        this.logger.error(`FFmpeg stderr: ${stderr}`);
        this.cleanupSession(sessionId);
      })
      .on('end', () => {
        this.logger.log(`FFmpeg vidéo terminé pour ${sessionId}.`);
      })
      .run();
  }

  private startAudioConversion(
    mkvUrl: string,
    streamIndex: number,
    playlistPath: string,
    segmentPath: string,
    sessionId: string,
    audioIndex: number,
    startTime?: number,
  ) {
    const ffmpegCommand = ffmpeg(mkvUrl);

    if (startTime) {
      ffmpegCommand.seekInput(startTime);
    }

    ffmpegCommand
      .outputOptions([
        '-map',
        `0:${streamIndex}`,
        '-c:a',
        'aac', // Encoder l'audio en AAC
        '-f',
        'hls',
        '-hls_time',
        '10',
        '-hls_list_size',
        '0',
        '-hls_segment_type',
        'fmp4',
        '-hls_flags',
        'independent_segments',
        '-hls_playlist_type',
        'event',
        '-hls_segment_filename',
        segmentPath,
      ])
      .output(playlistPath)
      .on('start', (commandLine) => {
        this.logger.log(`FFmpeg audio ${audioIndex} démarré : ${commandLine}`);
      })
      .on('error', (err, stdout, stderr) => {
        // Ignorer l'erreur si la session a déjà été nettoyée
        if (!fs.existsSync(path.dirname(playlistPath))) return;

        this.logger.error(
          `Erreur FFmpeg audio ${audioIndex} pour ${sessionId}: ${err.message}`,
        );
        this.logger.error(`FFmpeg stdout: ${stdout}`);
        this.logger.error(`FFmpeg stderr: ${stderr}`);
        this.cleanupSession(sessionId);
      })
      .on('end', () => {
        this.logger.log(
          `FFmpeg audio ${audioIndex} terminé pour ${sessionId}.`,
        );
      })
      .run();
  }

  private async waitForFile(
    filePath: string,
    timeoutMs: number = 10000,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (fs.existsSync(filePath)) {
        // Attendre un tout petit peu pour s'assurer que le fichier n'est pas vide
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Timeout waiting for file: ${filePath}`);
  }

  // Méthode pour nettoyer les fichiers d'une session HLS
  cleanupSession(sessionId: string): void {
    const sessionDir = path.join(this.HLS_TEMP_DIR, sessionId);
    if (fs.existsSync(sessionDir)) {
      this.logger.log(`Nettoyage de la session HLS : ${sessionId}`);
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }

  stopHlsStream(sessionId: string): void {
    this.cleanupSession(sessionId);
  }
}

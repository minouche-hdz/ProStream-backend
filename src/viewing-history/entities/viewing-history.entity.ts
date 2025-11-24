import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user/user';

@Entity()
export class ViewingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tmdbId: number; // ID du film ou de la série sur TMDB

  @Column()
  mediaType: string; // 'movie' ou 'tv'

  @Column()
  title: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column({ type: 'float', default: 0 })
  progress: number; // Progression de la lecture (en pourcentage ou en secondes)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastWatched: Date;

  @ManyToOne(() => User, user => user.viewingHistory)
  @JoinColumn({ name: 'userId' })
  user: User;
}

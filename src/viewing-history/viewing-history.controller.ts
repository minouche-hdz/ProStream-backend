import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ViewingHistoryService } from '@src/viewing-history/viewing-history.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard/jwt-auth.guard';
import { GetUser } from '@src/auth/get-user.decorator';
import { User } from '@src/users/entities/user/user';

@Controller('viewing-history')
@UseGuards(JwtAuthGuard)
export class ViewingHistoryController {
  constructor(private readonly viewingHistoryService: ViewingHistoryService) {}

  @Post()
  @Put() // Utiliser PUT pour les mises à jour et POST pour la création initiale si l'élément n'existe pas
  async updateViewingHistory(
    @GetUser() user: User,
    @Body('tmdbId') tmdbId: number,
    @Body('mediaType') mediaType: string,
    @Body('title') title: string,
    @Body('posterPath') posterPath: string,
    @Body('progress') progress: number,
  ) {
    return this.viewingHistoryService.updateViewingHistory(
      user.id,
      tmdbId,
      mediaType,
      title,
      posterPath,
      progress,
    );
  }

  @Get()
  async getViewingHistory(@GetUser() user: User) {
    return this.viewingHistoryService.getViewingHistory(user.id);
  }

  @Delete(':tmdbId/:mediaType')
  async removeViewingHistoryItem(
    @GetUser() user: User,
    @Param('tmdbId') tmdbId: number,
    @Param('mediaType') mediaType: string,
  ) {
    await this.viewingHistoryService.removeViewingHistoryItem(
      user.id,
      tmdbId,
      mediaType,
    );
    return { message: 'Item removed from viewing history' };
  }
}

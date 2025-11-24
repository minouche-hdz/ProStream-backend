import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user/user';

@Entity()
export class Watchlist {
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

  @ManyToOne(() => User, user => user.watchlists)
  @JoinColumn({ name: 'userId' })
  user: User;
}

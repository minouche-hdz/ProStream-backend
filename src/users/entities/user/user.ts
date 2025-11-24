import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../../user-role.enum';
import { Watchlist } from '../../watchlist/entities/watchlist.entity';
import { ViewingHistory } from '../../viewing-history/entities/viewing-history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // Optionnel pour les cas où le mot de passe n'est pas toujours exposé (ex: après hashage)
  password?: string;

  @Column('simple-array')
  roles: UserRole[];

  @OneToMany(() => Watchlist, watchlist => watchlist.user)
  watchlists: Watchlist[];

  @OneToMany(() => ViewingHistory, viewingHistory => viewingHistory.user)
  viewingHistory: ViewingHistory[];
}

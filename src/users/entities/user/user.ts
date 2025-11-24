import { UserRole } from '../../user-role.enum'; // Corrected path again

export class User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optionnel pour les cas où le mot de passe n'est pas toujours exposé (ex: après hashage)
  roles: UserRole[];
}

import { ViewingHistory } from './viewing-history.entity';
import { User } from '@src/users/entities/user/user';
import { UserRole } from '@src/users/user-role.enum';

describe('ViewingHistory Entity', () => {
  it('should create a viewing history instance', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const viewingHistory = new ViewingHistory();
    viewingHistory.id = 'some-uuid';
    viewingHistory.userId = user.id;
    viewingHistory.tmdbId = 123;
    viewingHistory.mediaType = 'movie';
    viewingHistory.title = 'Test Movie';
    viewingHistory.posterPath = '/path/to/poster.jpg';
    viewingHistory.progress = 75.5;
    viewingHistory.lastWatched = new Date();
    viewingHistory.user = user;

    expect(viewingHistory).toBeDefined();
    expect(viewingHistory.id).toEqual('some-uuid');
    expect(viewingHistory.userId).toEqual(user.id);
    expect(viewingHistory.tmdbId).toEqual(123);
    expect(viewingHistory.mediaType).toEqual('movie');
    expect(viewingHistory.title).toEqual('Test Movie');
    expect(viewingHistory.posterPath).toEqual('/path/to/poster.jpg');
    expect(viewingHistory.progress).toEqual(75.5);
    expect(viewingHistory.lastWatched).toBeInstanceOf(Date);
    expect(viewingHistory.user).toEqual(user);
  });

  it('should handle null posterPath', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const viewingHistory = new ViewingHistory();
    viewingHistory.id = 'some-uuid';
    viewingHistory.userId = user.id;
    viewingHistory.tmdbId = 123;
    viewingHistory.mediaType = 'movie';
    viewingHistory.title = 'Test Movie';
    viewingHistory.posterPath = null as any; // Cast to any to allow null for testing purposes
    viewingHistory.progress = 75.5;
    viewingHistory.lastWatched = new Date();
    viewingHistory.user = user;

    expect(viewingHistory.posterPath).toBeNull();
  });

  it('should default progress to 0', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const viewingHistory = new ViewingHistory();
    viewingHistory.id = 'some-uuid';
    viewingHistory.userId = user.id;
    viewingHistory.tmdbId = 123;
    viewingHistory.mediaType = 'movie';
    viewingHistory.title = 'Test Movie';
    viewingHistory.user = user;

    expect(viewingHistory.progress).toEqual(0);
  });
});

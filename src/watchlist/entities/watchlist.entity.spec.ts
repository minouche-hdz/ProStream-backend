import { Watchlist } from './watchlist.entity';
import { User } from '@src/users/entities/user/user';
import { UserRole } from '@src/users/user-role.enum';

describe('Watchlist Entity', () => {
  it('should create a watchlist instance', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const watchlist = new Watchlist();
    watchlist.id = 'some-uuid';
    watchlist.userId = user.id;
    watchlist.tmdbId = 123;
    watchlist.mediaType = 'movie';
    watchlist.title = 'Test Movie';
    watchlist.posterPath = '/path/to/poster.jpg';
    watchlist.user = user;

    expect(watchlist).toBeDefined();
    expect(watchlist.id).toEqual('some-uuid');
    expect(watchlist.userId).toEqual(user.id);
    expect(watchlist.tmdbId).toEqual(123);
    expect(watchlist.mediaType).toEqual('movie');
    expect(watchlist.title).toEqual('Test Movie');
    expect(watchlist.posterPath).toEqual('/path/to/poster.jpg');
    expect(watchlist.user).toEqual(user);
  });

  it('should handle null posterPath', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const watchlist = new Watchlist();
    watchlist.id = 'some-uuid';
    watchlist.userId = user.id;
    watchlist.tmdbId = 123;
    watchlist.mediaType = 'movie';
    watchlist.title = 'Test Movie';
    watchlist.posterPath = null as any; // Cast to any to allow null for testing purposes
    watchlist.user = user;

    expect(watchlist.posterPath).toBeNull();
  });
});

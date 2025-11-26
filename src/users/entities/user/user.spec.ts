import { User } from './user';
import { UserRole } from '../../user-role.enum';
import { Watchlist } from '../../../watchlist/entities/watchlist.entity';
import { ViewingHistory } from '../../../viewing-history/entities/viewing-history.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    user.id = 'some-uuid';
    user.nom = 'Doe';
    user.prenom = 'John';
    user.email = 'john.doe@example.com';
    user.password = 'hashedPassword123';
    user.roles = [UserRole.USER];
    user.watchlists = [];
    user.viewingHistory = [];

    expect(user).toBeDefined();
    expect(user.id).toEqual('some-uuid');
    expect(user.nom).toEqual('Doe');
    expect(user.prenom).toEqual('John');
    expect(user.email).toEqual('john.doe@example.com');
    expect(user.password).toEqual('hashedPassword123');
    expect(user.roles).toEqual([UserRole.USER]);
    expect(user.watchlists).toEqual([]);
    expect(user.viewingHistory).toEqual([]);
  });

  it('should allow password to be optional', () => {
    const user = new User();
    user.id = 'some-uuid';
    user.nom = 'Doe';
    user.prenom = 'Jane';
    user.email = 'jane.doe@example.com';
    user.roles = [UserRole.USER];

    expect(user.password).toBeUndefined();
  });

  it('should correctly assign watchlists and viewing history', () => {
    const user = new User();
    user.id = 'user-id';
    user.email = 'test@example.com';
    user.nom = 'Test';
    user.prenom = 'User';
    user.roles = [UserRole.USER];

    const watchlist1 = new Watchlist();
    watchlist1.id = 'wl1';
    watchlist1.userId = user.id;
    watchlist1.tmdbId = 1;
    watchlist1.mediaType = 'movie';
    watchlist1.title = 'Movie 1';
    watchlist1.posterPath = '/path1.jpg';
    watchlist1.user = user;

    const viewingHistory1 = new ViewingHistory();
    viewingHistory1.id = 'vh1';
    viewingHistory1.userId = user.id;
    viewingHistory1.tmdbId = 2;
    viewingHistory1.mediaType = 'tv';
    viewingHistory1.title = 'TV Show 1';
    viewingHistory1.posterPath = '/path2.jpg';
    viewingHistory1.progress = 75;
    viewingHistory1.lastWatched = new Date();
    viewingHistory1.user = user;

    user.watchlists = [watchlist1];
    user.viewingHistory = [viewingHistory1];

    expect(user.watchlists.length).toBe(1);
    expect(user.watchlists[0]).toEqual(watchlist1);
    expect(user.viewingHistory.length).toBe(1);
    expect(user.viewingHistory[0]).toEqual(viewingHistory1);
  });
});

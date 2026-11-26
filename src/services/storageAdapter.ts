import { RideMateDatabase } from '../types/ridemate';
import { createInitialSeedDatabase } from './seedData';

/**
 * StorageAdapter abstraction allows swapping browser localStorage
 * for a Supabase / PostgreSQL client without modifying UI components.
 */
export interface StorageAdapter {
  load(): RideMateDatabase;
  save(db: RideMateDatabase): void;
  reset(): RideMateDatabase;
}

const STORAGE_KEY = 'ridemate_campus_mvp_v2';

export class LocalStorageAdapter implements StorageAdapter {
  load(): RideMateDatabase {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = createInitialSeedDatabase();
        this.save(seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw) as Partial<RideMateDatabase>;
      if (!Array.isArray(parsed.users) || !Array.isArray(parsed.rides)) {
        const seeded = createInitialSeedDatabase();
        this.save(seeded);
        return seeded;
      }
      return {
        users: parsed.users ?? [],
        rides: parsed.rides ?? [],
        requests: parsed.requests ?? [],
        notifications: parsed.notifications ?? [],
        reports: parsed.reports ?? [],
        sessionUserId: parsed.sessionUserId ?? null,
      };
    } catch {
      const seeded = createInitialSeedDatabase();
      this.save(seeded);
      return seeded;
    }
  }

  save(db: RideMateDatabase): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
  }

  reset(): RideMateDatabase {
    const seeded = createInitialSeedDatabase();
    this.save(seeded);
    return seeded;
  }
}

export const storageAdapter: StorageAdapter = new LocalStorageAdapter();

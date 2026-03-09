import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DATA_DIR, 'poop.db');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS poop_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    type INTEGER CHECK(type >= 1 AND type <= 7),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_date ON poop_records(date);
  CREATE INDEX IF NOT EXISTS idx_type ON poop_records(type);
  CREATE INDEX IF NOT EXISTS idx_user_id ON poop_records(user_id);
`);

// User statements
const userStatements = {
  createUser: db.prepare(`
    INSERT INTO users (username, password_hash)
    VALUES (?, ?)
    RETURNING id, username, created_at
  `),

  getUserByUsername: db.prepare(`
    SELECT * FROM users WHERE username = ?
  `),

  getUserById: db.prepare(`
    SELECT id, username, created_at FROM users WHERE id = ?
  `),
};

// Prepared statements
const statements = {
  // Records CRUD
  getAllRecords: db.prepare(`
    SELECT * FROM poop_records
    WHERE user_id = ?
    ORDER BY date DESC, time DESC
  `),

  getRecordsByMonth: db.prepare(`
    SELECT * FROM poop_records
    WHERE user_id = ? AND date LIKE ?
    ORDER BY date, time
  `),

  getRecordsByDateRange: db.prepare(`
    SELECT * FROM poop_records
    WHERE user_id = ? AND date >= ? AND date <= ?
    ORDER BY date, time
  `),

  getRecordById: db.prepare(`
    SELECT * FROM poop_records WHERE id = ? AND user_id = ?
  `),

  getRecordsByDate: db.prepare(`
    SELECT * FROM poop_records WHERE user_id = ? AND date = ? ORDER BY time
  `),

  createRecord: db.prepare(`
    INSERT INTO poop_records (user_id, date, time, type, notes)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `),

  updateRecord: db.prepare(`
    UPDATE poop_records
    SET date = ?, time = ?, type = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
    RETURNING *
  `),

  deleteRecord: db.prepare(`
    DELETE FROM poop_records WHERE id = ? AND user_id = ?
    RETURNING id
  `),

  // Statistics
  getStatsByPeriod: db.prepare(`
    SELECT
      COUNT(*) as total_count,
      AVG(type) as avg_type,
      COUNT(DISTINCT date) as unique_days,
      SUM(CASE WHEN type >= 3 AND type <= 5 THEN 1 ELSE 0 END) as ideal_count
    FROM poop_records
    WHERE user_id = ? AND date >= ? AND date <= ?
  `),

  getTypeDistribution: db.prepare(`
    SELECT type, COUNT(*) as count
    FROM poop_records
    WHERE user_id = ? AND date >= ? AND date <= ?
    GROUP BY type
    ORDER BY type
  `),

  getDailyCounts: db.prepare(`
    SELECT date, COUNT(*) as count
    FROM poop_records
    WHERE user_id = ? AND date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date
  `),

  getAllDates: db.prepare(`
    SELECT DISTINCT date FROM poop_records WHERE user_id = ? ORDER BY date
  `),
};

export type User = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};

export type SafeUser = Omit<User, 'password_hash'>;

export type PoopRecord = {
  id: number;
  user_id: number;
  date: string;
  time: string | null;
  type: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreatePoopRecordInput = {
  date: string;
  time?: string;
  type: number;
  notes?: string;
};

export type UpdatePoopRecordInput = Partial<CreatePoopRecordInput>;

export const userOperations = {
  createUser(username: string, passwordHash: string): SafeUser {
    return userStatements.createUser.get(username, passwordHash) as SafeUser;
  },

  getUserByUsername(username: string): User | undefined {
    return userStatements.getUserByUsername.get(username) as User | undefined;
  },

  getUserById(id: number): SafeUser | undefined {
    return userStatements.getUserById.get(id) as SafeUser | undefined;
  },
};

export const dbOperations = {
  // Records
  getAllRecords(userId: number): PoopRecord[] {
    return statements.getAllRecords.all(userId) as PoopRecord[];
  },

  getRecordsByMonth(userId: number, yearMonth: string): PoopRecord[] {
    return statements.getRecordsByMonth.all(userId, `${yearMonth}%`) as PoopRecord[];
  },

  getRecordsByDateRange(userId: number, startDate: string, endDate: string): PoopRecord[] {
    return statements.getRecordsByDateRange.all(userId, startDate, endDate) as PoopRecord[];
  },

  getRecordById(userId: number, id: number): PoopRecord | undefined {
    return statements.getRecordById.get(id, userId) as PoopRecord | undefined;
  },

  getRecordsByDate(userId: number, date: string): PoopRecord[] {
    return statements.getRecordsByDate.all(userId, date) as PoopRecord[];
  },

  createRecord(userId: number, input: CreatePoopRecordInput): PoopRecord {
    return statements.createRecord.get(
      userId,
      input.date,
      input.time || null,
      input.type,
      input.notes || null
    ) as PoopRecord;
  },

  updateRecord(userId: number, id: number, input: UpdatePoopRecordInput): PoopRecord | undefined {
    const existing = this.getRecordById(userId, id);
    if (!existing) return undefined;

    return statements.updateRecord.get(
      input.date ?? existing.date,
      input.time ?? existing.time,
      input.type ?? existing.type,
      input.notes ?? existing.notes,
      id,
      userId
    ) as PoopRecord;
  },

  deleteRecord(userId: number, id: number): { id: number } | undefined {
    return statements.deleteRecord.get(id, userId) as { id: number } | undefined;
  },

  // Statistics
  getStatsByPeriod(userId: number, startDate: string, endDate: string) {
    return statements.getStatsByPeriod.get(userId, startDate, endDate) as {
      total_count: number;
      avg_type: number;
      unique_days: number;
      ideal_count: number;
    };
  },

  getTypeDistribution(userId: number, startDate: string, endDate: string) {
    return statements.getTypeDistribution.all(userId, startDate, endDate) as {
      type: number;
      count: number;
    }[];
  },

  getDailyCounts(userId: number, startDate: string, endDate: string) {
    return statements.getDailyCounts.all(userId, startDate, endDate) as {
      date: string;
      count: number;
    }[];
  },

  getAllDates(userId: number): string[] {
    const rows = statements.getAllDates.all(userId) as { date: string }[];
    return rows.map(r => r.date);
  },

  // Streak calculation
  getCurrentStreak(userId: number): number {
    const dates = this.getAllDates(userId);
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const hasRecordToday = dates.includes(today);
    const hasRecordYesterday = dates.includes(yesterday);

    if (!hasRecordToday && !hasRecordYesterday) {
      const lastDate = dates[dates.length - 1];
      const lastDateTime = new Date(lastDate).getTime();
      const now = Date.now();
      if (now - lastDateTime > 2 * 86400000) return 0;
    }

    let streak = 0;
    const dateSet = new Set(dates);
    let checkDate = hasRecordToday ? today : yesterday;

    while (dateSet.has(checkDate)) {
      streak++;
      const prevDate = new Date(new Date(checkDate).getTime() - 86400000);
      checkDate = prevDate.toISOString().split('T')[0];
    }

    return streak;
  }
};

export default db;

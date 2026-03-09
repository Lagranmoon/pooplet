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
  CREATE TABLE IF NOT EXISTS poop_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT,
    type INTEGER CHECK(type >= 1 AND type <= 7),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_date ON poop_records(date);
  CREATE INDEX IF NOT EXISTS idx_type ON poop_records(type);
`);

// Prepared statements
const statements = {
  // Records CRUD
  getAllRecords: db.prepare(`
    SELECT * FROM poop_records
    ORDER BY date DESC, time DESC
  `),

  getRecordsByMonth: db.prepare(`
    SELECT * FROM poop_records
    WHERE date LIKE ?
    ORDER BY date, time
  `),

  getRecordsByDateRange: db.prepare(`
    SELECT * FROM poop_records
    WHERE date >= ? AND date <= ?
    ORDER BY date, time
  `),

  getRecordById: db.prepare(`
    SELECT * FROM poop_records WHERE id = ?
  `),

  getRecordsByDate: db.prepare(`
    SELECT * FROM poop_records WHERE date = ? ORDER BY time
  `),

  createRecord: db.prepare(`
    INSERT INTO poop_records (date, time, type, notes)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `),

  updateRecord: db.prepare(`
    UPDATE poop_records
    SET date = ?, time = ?, type = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `),

  deleteRecord: db.prepare(`
    DELETE FROM poop_records WHERE id = ?
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
    WHERE date >= ? AND date <= ?
  `),

  getTypeDistribution: db.prepare(`
    SELECT type, COUNT(*) as count
    FROM poop_records
    WHERE date >= ? AND date <= ?
    GROUP BY type
    ORDER BY type
  `),

  getDailyCounts: db.prepare(`
    SELECT date, COUNT(*) as count
    FROM poop_records
    WHERE date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date
  `),

  getAllDates: db.prepare(`
    SELECT DISTINCT date FROM poop_records ORDER BY date
  `),
};

export type PoopRecord = {
  id: number;
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

export const dbOperations = {
  // Records
  getAllRecords(): PoopRecord[] {
    return statements.getAllRecords.all() as PoopRecord[];
  },

  getRecordsByMonth(yearMonth: string): PoopRecord[] {
    return statements.getRecordsByMonth.all(`${yearMonth}%`) as PoopRecord[];
  },

  getRecordsByDateRange(startDate: string, endDate: string): PoopRecord[] {
    return statements.getRecordsByDateRange.all(startDate, endDate) as PoopRecord[];
  },

  getRecordById(id: number): PoopRecord | undefined {
    return statements.getRecordById.get(id) as PoopRecord | undefined;
  },

  getRecordsByDate(date: string): PoopRecord[] {
    return statements.getRecordsByDate.all(date) as PoopRecord[];
  },

  createRecord(input: CreatePoopRecordInput): PoopRecord {
    return statements.createRecord.get(
      input.date,
      input.time || null,
      input.type,
      input.notes || null
    ) as PoopRecord;
  },

  updateRecord(id: number, input: UpdatePoopRecordInput): PoopRecord | undefined {
    const existing = this.getRecordById(id);
    if (!existing) return undefined;

    return statements.updateRecord.get(
      input.date ?? existing.date,
      input.time ?? existing.time,
      input.type ?? existing.type,
      input.notes ?? existing.notes,
      id
    ) as PoopRecord;
  },

  deleteRecord(id: number): { id: number } | undefined {
    return statements.deleteRecord.get(id) as { id: number } | undefined;
  },

  // Statistics
  getStatsByPeriod(startDate: string, endDate: string) {
    return statements.getStatsByPeriod.get(startDate, endDate) as {
      total_count: number;
      avg_type: number;
      unique_days: number;
      ideal_count: number;
    };
  },

  getTypeDistribution(startDate: string, endDate: string) {
    return statements.getTypeDistribution.all(startDate, endDate) as {
      type: number;
      count: number;
    }[];
  },

  getDailyCounts(startDate: string, endDate: string) {
    return statements.getDailyCounts.all(startDate, endDate) as {
      date: string;
      count: number;
    }[];
  },

  getAllDates(): string[] {
    const rows = statements.getAllDates.all() as { date: string }[];
    return rows.map(r => r.date);
  },

  // Streak calculation
  getCurrentStreak(): number {
    const dates = this.getAllDates();
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user recorded today or yesterday (allowing for current day)
    const hasRecordToday = dates.includes(today);
    const hasRecordYesterday = dates.includes(yesterday);

    if (!hasRecordToday && !hasRecordYesterday) {
      // Check if the last record was within the last 48 hours
      const lastDate = dates[dates.length - 1];
      const lastDateTime = new Date(lastDate).getTime();
      const now = Date.now();
      if (now - lastDateTime > 2 * 86400000) return 0;
    }

    // Calculate streak
    let streak = 0;
    const dateSet = new Set(dates);

    // Start from today or yesterday
    let checkDate = hasRecordToday ? today : yesterday;

    // Go backwards until we find a day without a record
    while (dateSet.has(checkDate)) {
      streak++;
      const prevDate = new Date(new Date(checkDate).getTime() - 86400000);
      checkDate = prevDate.toISOString().split('T')[0];
    }

    return streak;
  }
};

export default db;

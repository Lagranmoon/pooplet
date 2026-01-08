import { describe, it, expect } from 'vitest';
import { DIFFICULTY_CONFIG, type PoopLog, type User } from '../types';

describe('DIFFICULTY_CONFIG', () => {
  it('should have correct keys for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy).toBeDefined();
    expect(DIFFICULTY_CONFIG.normal).toBeDefined();
    expect(DIFFICULTY_CONFIG.hard).toBeDefined();
    expect(DIFFICULTY_CONFIG.very_hard).toBeDefined();
  });

  it('should have emoji for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy.emoji).toBe('💩');
    expect(DIFFICULTY_CONFIG.normal.emoji).toBe('😐');
    expect(DIFFICULTY_CONFIG.hard.emoji).toBe('😣');
    expect(DIFFICULTY_CONFIG.very_hard.emoji).toBe('😫');
  });

  it('should have label for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy.label).toBe('顺畅');
    expect(DIFFICULTY_CONFIG.normal.label).toBe('正常');
    expect(DIFFICULTY_CONFIG.hard.label).toBe('困难');
    expect(DIFFICULTY_CONFIG.very_hard.label).toBe('艰辛');
  });

  it('should have color for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy.color).toBe('text-green-500');
    expect(DIFFICULTY_CONFIG.normal.color).toBe('text-yellow-500');
    expect(DIFFICULTY_CONFIG.hard.color).toBe('text-orange-500');
    expect(DIFFICULTY_CONFIG.very_hard.color).toBe('text-red-500');
  });

  it('should have bg for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy.bg).toBe('bg-green-100');
    expect(DIFFICULTY_CONFIG.normal.bg).toBe('bg-yellow-100');
    expect(DIFFICULTY_CONFIG.hard.bg).toBe('bg-orange-100');
    expect(DIFFICULTY_CONFIG.very_hard.bg).toBe('bg-red-100');
  });
});

describe('PoopLog', () => {
  it('should create a valid log', () => {
    const log: PoopLog = {
      id: 'log-123',
      userId: 'user-456',
      timestamp: new Date(),
      difficulty: 'easy',
      note: 'Test note',
    };

    expect(log.id).toBe('log-123');
    expect(log.difficulty).toBe('easy');
    expect(log.note).toBe('Test note');
  });

  it('should handle empty note field', () => {
    const log: PoopLog = {
      id: 'log-123',
      userId: 'user-456',
      timestamp: new Date(),
      difficulty: 'normal',
      note: '',
    };

    expect(log.note).toBe('');
  });

  it('should support all difficulty levels', () => {
    const difficulties: PoopLog['difficulty'][] = ['easy', 'normal', 'hard', 'very_hard'];

    difficulties.forEach((diff) => {
      const log: PoopLog = {
        id: 'log-123',
        userId: 'user-456',
        timestamp: new Date(),
        difficulty: diff,
        note: 'Test',
      };
      expect(log.difficulty).toBe(diff);
    });
  });
});

describe('User', () => {
  it('should create a valid user', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      createdAt: new Date(),
    };

    expect(user.id).toBe('user-123');
    expect(user.name).toBe('Test User');
  });

  it('should handle avatar field', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      avatar: 'avatar-url',
      createdAt: new Date(),
    };

    expect(user.avatar).toBe('avatar-url');
  });
});

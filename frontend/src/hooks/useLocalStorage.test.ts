import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle objects', () => {
    const initialObj = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj-key', initialObj));

    expect(result.current[0]).toEqual(initialObj);

    act(() => {
      result.current[1]({ name: 'Updated', count: 1 });
    });

    expect(result.current[0]).toEqual({ name: 'Updated', count: 1 });
    expect(localStorage.getItem('obj-key')).toBe(JSON.stringify({ name: 'Updated', count: 1 }));
  });

  it('should handle arrays', () => {
    const initialArr = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('arr-key', initialArr));

    expect(result.current[0]).toEqual(initialArr);

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'invalid-json');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('bool-key')).toBe('true');
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage('null-key', null as string | null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]('not-null');
    });

    expect(result.current[0]).toBe('not-null');
  });
});

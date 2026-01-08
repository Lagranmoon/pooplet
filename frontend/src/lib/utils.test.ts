import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('should handle conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active-class', false && 'inactive-class')).toBe('base-class active-class');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3');
  });

  it('should handle Tailwind conflicts', () => {
    expect(cn('p-4 p-2')).toBe('p-2');
  });
});

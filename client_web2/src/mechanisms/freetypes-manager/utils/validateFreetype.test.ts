import { describe, expect, it } from 'vitest';
import { validateFreetypeName, validateFreetypeTemplate } from './validateFreetype';

describe('validateFreetypeTemplate', () => {
  it('requires at least one $variable', () => {
    expect(validateFreetypeTemplate('plain').valid).toBe(false);
    expect(validateFreetypeTemplate('Hello $name').valid).toBe(true);
  });
});

describe('validateFreetypeName', () => {
  it('rejects duplicate names', () => {
    expect(
      validateFreetypeName('score', [{ _id: '1', name: 'score', template: '$x' }]),
    ).toBe(false);
  });
});

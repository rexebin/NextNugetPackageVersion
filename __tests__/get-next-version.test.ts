/**
 * Unit tests for src/wait.ts
 */

import { expect } from '@jest/globals';
import { getNextBetaVersion, getNextVersion } from '../src/get-next-version';

describe('get next version', () => {
  it('should increment beta version from last beta version', () => {
    const result = getNextBetaVersion('1.0.0-beta.1');
    expect(result).toBe('1.0.0-beta.2');
  });

  it('should publish main version from last beta', () => {
    const result = getNextVersion('1.0.0-beta.1');
    expect(result).toBe('1.0.0');
  });

  it('should increment main version and create beta 1 for next patch version', () => {
    const result = getNextBetaVersion('1.0.0');
    expect(result).toBe('1.0.1-beta.1');
  });

  it('should increment main version from last main version', () => {
    const result = getNextVersion('1.0.0');
    expect(result).toBe('1.0.1');
  });
});

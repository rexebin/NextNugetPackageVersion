/**
 * Unit tests for src/wait.ts
 */

import { getCurrentVersion } from '../src/get-current-version';

function mockVersion(version: string) {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: jest
      .fn()
      .mockResolvedValue(version === '' ? [] : [{ name: version }]),
    ok: true
  } as any as Promise<Response>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('get current version', () => {
  it('should return current version', async () => {
    mockVersion('1.0.0');
    const result = await getCurrentVersion('token');
    expect(result).toBe('1.0.0');
  });

  it('should return empty string if no version', async () => {
    mockVersion('');
    const result = await getCurrentVersion('token');
    expect(result).toBe('');
  });

  it('should return empty string if Github api returns 404 not found', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn(),
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as any as Promise<Response>);
    const result = await getCurrentVersion('token');
    expect(result).toBe('');
  });

  it('should throw if Github API return not Ok and not 404 not found', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn(),
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any as Promise<Response>);
    const result = getCurrentVersion('token');
    await expect(result).rejects.toThrow(
      'Failed to get current version: Internal Server Error'
    );
  });
});

/**
 * Unit tests for src/wait.ts
 */

import { getCurrentVersion } from '../src/get-current-version'

function mockVersion(version: string) {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: jest.fn().mockResolvedValue(version === '' ? [] : [{ name: version }])
  } as any as Promise<Response>)
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('get current version', () => {
  it('should return current version', async () => {
    mockVersion('1.0.0')
    const result = await getCurrentVersion('token')
    expect(result).toBe('1.0.0')
  })

  it('should return empty string if no version', async () => {
    mockVersion('')
    const result = await getCurrentVersion('token')
    expect(result).toBe('')
  })
})

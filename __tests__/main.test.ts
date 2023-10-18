import { run } from '../src/main'
import * as core from '@actions/core'

function mockCurrentVersion(version: string) {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: jest.fn().mockResolvedValue(version === '' ? [] : [{ name: version }])
  } as any as Promise<Response>)
}

function mockInputs(
  mainVersion: string,
  minorVersion: string,
  publishBeta: string
) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    if (name === 'org') {
      return 'org'
    }
    if (name === 'packageName') {
      return 'packageName'
    }
    if (name === 'minorVersion') {
      return minorVersion
    }
    if (name === 'mainVersion') {
      return mainVersion
    }
    if (name === 'publishBeta') {
      return publishBeta
    }
    throw new Error(`Unexpected input ${name}`)
  })
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('get current version', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV, ...{ GITHUB_TOKEN: 'mytoken' } } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  describe('when current version is empty', () => {
    it.each([
      ['1', '0', 'false', '1.0.0'],
      ['2', '1', 'FalSe', '2.1.0'],
      ['1', '0', 'TRUE', '1.0.0-beta.1'],
      ['2', '1', 'TRuE', '2.1.0-beta.1'],
      ['2', '1', 'true', '2.1.0-beta.1']
    ])(
      'when main version is %s, minor version is %s, beta: %s, should return %s',
      async (mainVersion, minorVersion, publishBeta, expectedVersion) => {
        mockCurrentVersion('')
        mockInputs(mainVersion, minorVersion, publishBeta)
        const spy = jest.spyOn(core, 'setOutput')
        await run()
        expect(spy).toHaveBeenCalledWith('version', expectedVersion)
      }
    )
  })

  describe('when current version does not match given main or minor version', () => {
    it.each([
      ['0.0.0', 'false', '1.0.0'],
      ['0.0.0', 'true', '1.0.0-beta.1'],
      ['0.1.0-beta.1', 'false', '1.0.0'],
      ['0.1.1-beta.1', 'true', '1.0.0-beta.1']
    ])(
      'when current: %s, publish beta: %s, should return: %s',
      async (currentVersion, publishBeta, expectedVersion) => {
        mockCurrentVersion(currentVersion)
        mockInputs('1', '0', publishBeta)
        const spy = jest.spyOn(core, 'setOutput')
        await run()
        expect(spy).toHaveBeenCalledWith('version', expectedVersion)
      }
    )
  })

  describe('when current version match the given main or minor version', () => {
    it.each([
      ['1.0.0', 'false', '1.0.1'],
      ['1.0.99', 'false', '1.0.100'],
      ['1.0.900', 'false', '1.0.901'],

      ['1.0.0', 'true', '1.0.1-beta.1'],
      ['1.0.99', 'true', '1.0.100-beta.1'],
      ['1.0.900', 'true', '1.0.901-beta.1'],

      ['1.0.5-beta.1', 'false', '1.0.5'],
      ['1.0.10-beta.90', 'false', '1.0.10'],
      ['1.0.5-beta.900', 'false', '1.0.5'],
      ['1.0.10-beta.90', 'false', '1.0.10'],
      ['1.0.99-beta.90', 'false', '1.0.99'],
      ['1.0.999-beta.90', 'false', '1.0.999'],

      ['1.0.5-beta.1', 'true', '1.0.5-beta.2'],
      ['1.0.10-beta.90', 'true', '1.0.10-beta.91'],
      ['1.0.5-beta.900', 'true', '1.0.5-beta.901'],
      ['1.0.10-beta.90', 'true', '1.0.10-beta.91']
    ])(
      'when current: %s, publish beta: %s, should return: %s',
      async (currentVersion, publishBeta, expectedVersion) => {
        mockCurrentVersion(currentVersion)
        mockInputs('1', '0', publishBeta)
        const spy = jest.spyOn(core, 'setOutput')
        await run()
        expect(spy).toHaveBeenCalledWith('version', expectedVersion)
      }
    )
  })
})

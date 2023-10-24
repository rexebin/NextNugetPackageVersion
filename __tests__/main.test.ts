import { run } from '../src/main';
import * as core from '@actions/core';
// @ts-ignore
import { mockInputs } from './mock-inputs';

function mockCurrentVersion(version: string) {
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
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV, ...{ GITHUB_TOKEN: 'mytoken' } };
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe('inputs should be validated', () => {
    it('should throw if no token is given', async () => {
      process.env = { ...OLD_ENV, ...{ GITHUB_TOKEN: undefined } };
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith(
        'GITHUB_TOKEN not set, please set the GITHUB_TOKEN environment variable to secrets.GITHUB_TOKEN'
      );
    });

    it('should throw if no org is given', async () => {
      mockInputs('1', '0', 'false', '');
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith('Input org is not set');
    });

    it('should throw if no package name is given', async () => {
      mockInputs('1', '0', 'false', 'org', '');
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith(
        'Input packageName is not set'
      );
    });

    it('should throw if no major version is given', async () => {
      mockInputs('', '0', 'false');
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith(
        'Input majorVersion is not set'
      );
    });

    it('should throw if no minor version is given', async () => {
      mockInputs('1', '', 'false');
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith(
        'Input minorVersion is not set'
      );
    });
  });

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
        mockCurrentVersion('');
        mockInputs(mainVersion, minorVersion, publishBeta);
        const spy = jest.spyOn(core, 'setOutput');
        await run();
        expect(spy).toHaveBeenCalledWith('version', expectedVersion);
      }
    );
  });

  describe('when current version does not match given main or minor version', () => {
    it.each([
      ['0.0.0', 'false', '1.0.0'],
      ['0.0.0', 'true', '1.0.0-beta.1'],
      ['0.1.0-beta.1', 'false', '1.0.0'],
      ['0.1.1-beta.1', 'true', '1.0.0-beta.1']
    ])(
      'when current: %s, publish beta: %s, should return: %s',
      async (currentVersion, publishBeta, expectedVersion) => {
        mockCurrentVersion(currentVersion);
        mockInputs('1', '0', publishBeta);
        const spy = jest.spyOn(core, 'setOutput');
        await run();
        expect(spy).toHaveBeenCalledWith('version', expectedVersion);
      }
    );
  });

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
        mockCurrentVersion(currentVersion);
        mockInputs('1', '0', publishBeta);
        const spy = jest.spyOn(core, 'setOutput');
        await run();
        expect(spy).toHaveBeenCalledWith('version', expectedVersion);
      }
    );
  });
});

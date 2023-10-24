import * as core from '@actions/core';

export function mockInputs(
  majorVersion: string,
  minorVersion: string,
  publishBeta: string,
  org = 'org',
  packageName = 'packageName'
) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    if (name === 'org') {
      return org;
    }
    if (name === 'packageName') {
      return packageName;
    }
    if (name === 'minorVersion') {
      return minorVersion;
    }
    if (name === 'majorVersion') {
      return majorVersion;
    }
    if (name === 'publishBeta') {
      return publishBeta;
    }
    throw new Error(`Unexpected input ${name}`);
  });
}

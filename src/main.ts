import * as core from '@actions/core';
import { getNextBetaVersion, getNextVersion } from './get-next-version';
import { getCurrentVersion } from './get-current-version';

function setFirstVersion(mainVersion: string, minorVersion: string) {
  core.setOutput('version', `${mainVersion}.${minorVersion}.0`);
}

function setFirstBetaVersion(mainVersion: string, minorVersion: string) {
  core.setOutput('version', `${mainVersion}.${minorVersion}.0-beta.1`);
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token: string | undefined = process.env.GITHUB_TOKEN;

    if (token === undefined) {
      throw new Error(
        `GITHUB_TOKEN not set, please set the GITHUB_TOKEN environment variable to secrets.GITHUB_TOKEN`
      );
    }
    const minorVersion = core.getInput('minorVersion');
    const majorVersion = core.getInput('majorVersion');
    const publishBeta = core.getInput('publishBeta').toLowerCase() === 'true';

    const currentVersion = await getCurrentVersion(token);

    if (currentVersion === '') {
      console.log(`No current version found`);
      publishBeta
        ? setFirstBetaVersion(majorVersion, minorVersion)
        : setFirstVersion(majorVersion, minorVersion);
      return;
    }

    const currentVersionParts = currentVersion.split('.');

    if (
      currentVersionParts[0] !== majorVersion ||
      currentVersionParts[1] !== minorVersion
    ) {
      console.log(
        `Current version ${currentVersion} does not match main version ${majorVersion} or minor version ${minorVersion}`
      );
      publishBeta
        ? setFirstBetaVersion(majorVersion, minorVersion)
        : setFirstVersion(majorVersion, minorVersion);
      return;
    }

    publishBeta
      ? core.setOutput('version', getNextBetaVersion(currentVersion))
      : core.setOutput('version', getNextVersion(currentVersion));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}

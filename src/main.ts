import * as core from '@actions/core'
import { getNextVersion } from './get-next-version'
import { getCurrentVersion } from './get-current-version'

function setFirstVersion(
  mainVersion: string,
  minorVersion: string,
  publishBeta: boolean
) {
  const nextVersion = `${mainVersion}.${minorVersion}.0`
  if (publishBeta) {
    core.setOutput('version', `${nextVersion}-beta.1`)
    return
  }
  core.setOutput('version', nextVersion)
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token: string | undefined = process.env.GITHUB_TOKEN

    if (token === undefined) {
      throw new Error(
        `GITHUB_TOKEN not set, please set the GITHUB_TOKEN environment variable to secrets.GITHUB_TOKEN`
      )
    }
    const minorVersion = core.getInput('minorVersion')
    const mainVersion = core.getInput('mainVersion')
    const publishBeta: boolean =
      core.getInput('publishBeta').toLowerCase() === 'true'

    const currentVersion = await getCurrentVersion(token)

    if (currentVersion === '') {
      console.log(`No current version found`)
      setFirstVersion(mainVersion, minorVersion, publishBeta)
      return
    }

    const currentVersionParts = currentVersion.split('.')

    if (
      currentVersionParts[0] !== mainVersion ||
      currentVersionParts[1] !== minorVersion
    ) {
      console.log(
        `Current version ${currentVersion} does not match main version ${mainVersion} or minor version ${minorVersion}`
      )
      setFirstVersion(mainVersion, minorVersion, publishBeta)
      return
    }

    const nextVersion = getNextVersion(currentVersion, publishBeta)
    core.setOutput('version', nextVersion)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

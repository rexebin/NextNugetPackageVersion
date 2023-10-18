import * as core from '@actions/core'

interface GithubPackageVersion {
  Id: string
  Name: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const org: string = core.getInput('org')
    const packageName: string = core.getInput('packageName')
    const token: string | undefined = process.env.GITHUB_TOKEN
    if (token === undefined) {
      throw new Error('GITHUB_TOKEN not set')
    }
    const response: Response = await fetch(
      `https://api.github.com/orgs/${org}/packages/nuget/${packageName}/versions`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const body: GithubPackageVersion[] = await response.json()
    console.log(JSON.stringify(body))
    core.debug(JSON.stringify(body))
    throw new Error(JSON.stringify(body))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

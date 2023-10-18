import * as core from '@actions/core'

interface GithubPackageVersion {
  id: string
  name: string
}

export async function getCurrentVersion(token: string): Promise<string> {
  const org: string = core.getInput('org')
  const packageName: string = core.getInput('packageName')

  const response: Response = await fetch(
    `https://api.github.com/orgs/${org}/packages/nuget/${packageName}/versions`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  const body: GithubPackageVersion[] = await response.json()

  if (!body) {
    console.log('failed to get current version')
    return ''
  }
  if (body.length === 0) {
    return ''
  }

  return body[0].name
}

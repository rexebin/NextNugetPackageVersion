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

  if (!response.ok) {
    throw new Error(`Failed to get current version: ${response.statusText}`)
  }

  const body: GithubPackageVersion[] = await response.json()
  if (body.length === 0) {
    console.log('No current version found')
    return ''
  }
  if (!body) {
    console.log('Failed to get current version')
    return ''
  }

  if (!body[0]) {
    console.log('Failed to get current version')
    return ''
  }

  return body[0].name
}

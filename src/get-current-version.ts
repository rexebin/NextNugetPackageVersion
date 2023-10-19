import * as core from '@actions/core';

interface GithubPackageVersion {
  id: string;
  name: string;
}

export async function getCurrentVersion(token: string): Promise<string> {
  const org: string = core.getInput('org');
  const packageName: string = core.getInput('packageName');

  const response: Response = await fetch(
    `https://api.github.com/orgs/${org}/packages/nuget/${packageName}/versions`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const notFoundMessage =
    'No current version found. If this is not expected, check your org, package name and token.';

  if (!response.ok) {
    if (response.status === 404) {
      console.log(notFoundMessage);
      return '';
    }
    throw new Error(`Failed to get current version: ${response.statusText}`);
  }

  const body: GithubPackageVersion[] = await response.json();
  if (body.length === 0) {
    console.log(notFoundMessage);
    return '';
  }

  return body[0]?.name;
}

import * as core from '@actions/core'

interface GithubPackageVersion {
    Id: string;
    Name: string;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        const org: string = core.getInput('org')
        const packageName: string = core.getInput('packageName')
        const token: string = core.getInput('token')
        const response: Response = await fetch(`https://api.github.com/orgs/${org}/packages/nuget/${packageName}/versions`, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });
        response.json().then((data: GithubPackageVersion[]) => {
            core.debug(JSON.stringify(data));
            // core.setOutput(data['versions'][0], new Date().toTimeString());
        });
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}

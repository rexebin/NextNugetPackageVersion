# GitHub Action for calculate next nuget version from Github Packages

![CI](https://github.com/rexebin/next-nuget-package-version/actions/workflows/ci.yml/badge.svg)
![coverage.svg](./badges/coverage.svg)

This GitHub action calls [GitHub API `https://api.github.com/orgs/${org}/packages/nuget/${packageName}/versions`](https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#list-package-versions-for-a-package-owned-by-an-organization)
with `${{ secrets.GITHUB_TOKEN }}`, to get the latest version and calculate the next version number from inputs such as:

1. main version
2. minor version
3. publish beta or not

## Version Calculations

| Main Version | Minor Version | Last Version    | Publish Beta | Next Version | Note                                                               
|--------------|---------------|-----------------|--------------|--------------|--------------------------------------------------------------------
| 1            | 0             | ''              | true         | 1.0.0-beta.1 | first version                                                      
| 1            | 0             | ''              | false        | 1.0.0        | first version                                                      
| 1            | 0             | '1.0.1'         | true         | 1.0.2.beta.1 | create beta 1 for next patch version                               
| 1            | 0             | '1.0.1'         | false        | 1.0.2        | increment patch version                                            
| 1            | 0             | '1.0.1.beta.1'  | true         | 1.0.1.beta.2 | increment beta version                                             
| 1            | 0             | '1.0.1.beta.1'  | false        | 1.0.1        | create next version from beta                                      
| 1            | 1             | '1.0.20'        | false        | 1.1.0        | last version doesn't match input minor version, bump minor version 
| 1            | 1             | '1.0.20'        | true         | 1.1.0.beta.1 | last version doesn't match input minor version, bump minor version 
| 2            | 0             | '1.0.20.beta.1' | false        | 2.0.0        | last version doesn't match input main version, bump main version   
| 2            | 0             | '1.0.20.beta.1' | false        | 2.0.0.beta.1 | last version doesn't match input main version, bump main version   

## Usage

```yaml

steps:  
  - name: Test Local Action
    uses: rexebin/next-nuget-package-version@v1.0.0
    id: next-nuget-package-version    
    env: 
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    with:
      org: YourOrgName
      packageName: YourPackageName
      mainVersion: 1
      minorVersion: 0
      publishBeta: false

  - name: Print Output
    id: output
    run: echo "${{ steps.next-nuget-package-version.outputs.version }}"

```

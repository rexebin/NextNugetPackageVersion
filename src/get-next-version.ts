function incrementBetaVersion(currentVersion: string) {
  const versionParts = currentVersion.split('-beta.');
  const version = versionParts[0];
  const betaVersion = versionParts[1];
  const betaNumber = parseInt(betaVersion);
  const nextBetaNumber = betaNumber + 1;
  return `${version}-beta.${nextBetaNumber}`;
}

function incrementPatchVersion(currentVersion: string): string {
  const versionParts = currentVersion.split('.');
  const major = versionParts[0];
  const minor = versionParts[1];
  const patch = versionParts[2];
  const patchNumber = parseInt(patch);
  const nextPatchNumber = patchNumber + 1;
  return `${major}.${minor}.${nextPatchNumber}`;
}

export function getNextVersion(
  currentVersion: string,
  publishBeta: boolean
): string {
  if (publishBeta) {
    if (currentVersion.includes('-beta')) {
      console.log(
        `Incrementing beta version from last beta version ${currentVersion}`
      );
      return incrementBetaVersion(currentVersion);
    } else {
      const nextMainVersion = incrementPatchVersion(currentVersion);
      console.log(
        `Incrementing main version to ${nextMainVersion} from ${currentVersion} and adding beta.1`
      );
      return `${nextMainVersion}-beta.1`;
    }
  } else {
    if (currentVersion.includes('-beta')) {
      console.log(
        `Publish main version from last beta version ${currentVersion}`
      );
      return currentVersion.split('-beta')[0];
    } else {
      console.log(
        `Incrementing patch version from last main version ${currentVersion}`
      );
      return incrementPatchVersion(currentVersion);
    }
  }
}

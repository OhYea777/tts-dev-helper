import { satisfies } from 'semver';

import { engines } from '../../package.json';

export function checkEngines() {
  const currentNode = process.versions.node;
  const nodeRange = engines.node;

  if (!satisfies(currentNode, nodeRange)) {
    throw new Error(
      `Current node version ${currentNode} does not satisfy required node version ${nodeRange}`
    );
  }
}

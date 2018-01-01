import tempy from 'tempy';
import execa from 'execa';

/**
 * Create a temporary git repository and change the current working directory to the repository root.
 *
 * @return {string} The path of the repository.
 */
export async function gitRepo() {
  const dir = tempy.directory();

  process.chdir(dir);
  await execa('git', ['init']);
  await gitCheckout('master');
  return dir;
}

/**
 * Checkout a branch on the current git repository.
 *
 * @param {String} branch Branch name.
 * @param {boolean} create `true` to create the branche ans switch, `false` to only switch.
 */
export async function gitCheckout(branch, create = true) {
  await execa('git', create ? ['checkout', '-b', branch] : ['checkout', branch]);
}

/**
 * Create commit on the current git repository.
 *
 * @param {String} message commit message.
 *
 * @returns {Commit} The created commits.
 */
export async function gitCommit(message) {
  const {stdout} = await execa('git', ['commit', '-m', message, '--allow-empty', '--no-gpg-sign']);
  const [, branch, hash] = /^\[(\w+)\(?.*?\)?(\w+)\] .+(?:\n|$)/.exec(stdout);
  return {branch, hash, message};
}

import tempy from 'tempy';
import execa from 'execa';
import gitLogParser from 'git-log-parser';
import getStream from 'get-stream';

/**
 * Initialize an existing bare repository:
 * - Clone the repository
 * - Change the current working directory to the clone root
 * - Create a default branch
 * - Create an initial commits
 * - Push to origin
 *
 * @param {String} origin The URL of the bare repository.
 * @param {String} [branch='master'] the branch to initialize.
 */
export async function initBareRepo(origin, branch = 'master') {
  const clone = tempy.directory();
  await execa('git', ['clone', '--no-hardlinks', origin, clone]);
  process.chdir(clone);
  await gitCheckout(branch);
  await gitCommit('Initial commit');
  await execa('git', ['push', origin, branch]);
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

/**
 * Create a shallow clone of a git repository and change the current working directory to the cloned repository root.
 * The shallow will contain a limited number of commit and no tags.
 *
 * @param {String} origin The path of the repository to clone.
 * @param {Number} [depth=1] The number of commit to clone.
 * @return {String} The path of the cloned repository.
 */
export async function gitShallowClone(origin, branch = 'master', depth = 1) {
  const dir = tempy.directory();

  process.chdir(dir);
  await execa('git', ['clone', '--no-hardlinks', '--no-tags', '-b', branch, '--depth', depth, origin, dir]);
  return dir;
}

/**
 * Get the list of parsed commits since a git reference.
 *
 * @param {String} [from] Git reference from which to seach commits.
 * @return {Array<Object>} The list of parsed commits.
 */
export async function gitGetCommit(from) {
  Object.assign(gitLogParser.fields, {hash: 'H', message: 'B', gitTags: 'd', committerDate: {key: 'ci', type: Date}});
  return (await getStream.array(gitLogParser.parse({_: `${from ? from + '..' : ''}HEAD`}))).map(commit => {
    commit.message = commit.message.trim();
    commit.gitTags = commit.gitTags.trim();
    return commit;
  });
}

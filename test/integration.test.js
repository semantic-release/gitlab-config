import test from 'ava';
import {writeJson, readJson} from 'fs-extra';
import {stub} from 'sinon';
import execa from 'execa';
import stripAnsi from 'strip-ansi';
import semanticRelease from 'semantic-release';
import mockServer from './helpers/mockserver';
import npmRegistry from './helpers/npm-registry';
import gitbox from './helpers/gitbox';
import {gitCommit} from './helpers/git-utils';

/* eslint camelcase: ["error", {properties: "never"}] */

// Save the current process.env
const envBackup = {...process.env};
// Save the current working diretory
const cwd = process.cwd();
// Disable npm logs during tests
stub(process.stderr, 'write');

const gitlabConfig = require.resolve('..');

test.before(async () => {
  // Start the local Git server
  await gitbox.start();
  // Start Mock Server
  await mockServer.start();
  // Start the local NPM registry
  await npmRegistry.start();
});

test.beforeEach(t => {
  Object.assign(process.env, npmRegistry.authEnv);
  t.context.logs = '';
  t.context.stdout = stub(process.stdout, 'write').callsFake(val => {
    t.context.logs += stripAnsi(val.toString());
  });

  process.env.TRAVIS = 'true';
  process.env.CI = 'true';
  process.env.TRAVIS_BRANCH = 'master';
  process.env.TRAVIS_PULL_REQUEST = 'false';
});

test.afterEach.always(t => {
  // Restore process.env
  process.env = envBackup;
  // Restore the current working directory
  process.chdir(cwd);
  t.context.stdout.restore();
});

test.after.always(async () => {
  // Stop the local Git server
  await gitbox.stop();
  // Stop Mock Server
  await mockServer.stop();
  // Stop the local NPM registry
  await npmRegistry.stop();
});

test.serial('Initial and minor releases', async t => {
  const packageName = 'test-release';
  const owner = 'git';
  // Create a remote repo, initialize it, create a local shallow clone and set the cwd to the clone
  const {repositoryUrl} = await gitbox.createRepo(packageName);
  process.env.GIT_CREDENTIALS = gitbox.gitCredential;
  process.env.GL_TOKEN = 'gitlab_token';
  process.env.GITLAB_URL = mockServer.url;
  process.env.GITLAB_PREFIX = '';
  process.env.NPM_TOKEN = 'NPM_TOKEN';
  await writeJson('./package.json', {
    name: packageName,
    version: '0.0.0-dev',
    publishConfig: {registry: npmRegistry.url},
    repository: {url: repositoryUrl},
  });

  /* Initial release */
  let version = '1.0.0';
  let verifyGitLabMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}`,
    {},
    {body: {permissions: {project_access: {access_level: 30}}}, method: 'GET'}
  );
  let createReleaseMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}/release`,
    {body: {tag_name: `v${version}`}},
    {body: {}, method: 'POST'}
  );
  t.log('Commit a feature');
  await gitCommit('feat: new feature');

  t.log('Initial release');
  await semanticRelease({extends: gitlabConfig});

  await mockServer.verify(verifyGitLabMock);
  await mockServer.verify(createReleaseMock);
  t.regex(t.context.logs, /Publishing version 1\.0\.0 to npm registry/);
  t.regex(t.context.logs, /Published GitLab release: v1\.0\.0/);
  t.is((await readJson('./package.json')).version, version);

  /* Minor release */
  version = '1.1.0';
  verifyGitLabMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}`,
    {},
    {body: {permissions: {project_access: {access_level: 30}}}, method: 'GET'}
  );
  createReleaseMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}/release`,
    {body: {tag_name: `v${version}`}},
    {body: {}, method: 'POST'}
  );
  t.log('Commit a feature');
  await execa('git', ['commit', '-m', 'feat: other feature', '--allow-empty', '--no-gpg-sign']);

  t.log('Minor release');
  await semanticRelease({extends: gitlabConfig});

  await mockServer.verify(verifyGitLabMock);
  await mockServer.verify(createReleaseMock);
  t.regex(t.context.logs, /Publishing version 1\.1\.0 to npm registry/);
  t.regex(t.context.logs, /Published GitLab release: v1\.1\.0/);
  t.is((await readJson('./package.json')).version, version);
});

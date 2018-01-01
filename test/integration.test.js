import test from 'ava';
import {writeJson, readJson} from 'fs-extra';
import {stub} from 'sinon';
import execa from 'execa';
import stripAnsi from 'strip-ansi';
import semanticRelease from 'semantic-release';
import mockServer from './helpers/mockserver';
import npmRegistry from './helpers/npm-registry';
import {gitRepo, gitCommit} from './helpers/git-utils';

/* eslint camelcase: ["error", {properties: "never"}] */

// Save the current process.env
const envBackup = Object.assign({}, process.env);
// Save the current working diretory
const cwd = process.cwd();
// Disable npm logs during tests
stub(process.stderr, 'write');

const gitlabConfig = require.resolve('..');

test.before(async () => {
  // Start Mock Server
  await mockServer.start();
  // Start the local NPM registry
  await npmRegistry.start();
});

test.beforeEach(async t => {
  // Create a git repository, set the current working directory at the root of the repo
  await gitRepo();
  await gitCommit('Initial commit');
  Object.assign(process.env, npmRegistry.authEnv);
  t.context.logs = '';
  t.context.stdout = stub(process.stdout, 'write').callsFake(val => {
    t.context.logs += stripAnsi(val.toString());
  });
});

test.afterEach.always(t => {
  // Restore process.env
  process.env = envBackup;
  // Restore the current working directory
  process.chdir(cwd);
  t.context.stdout.restore();
});

test.after.always(async () => {
  // // Stop the local Git server
  // await gitbox.stop();
  // Stop Mock Server
  await mockServer.stop();
  // Stop the local NPM registry
  await npmRegistry.stop();
});

test.serial('Initial and minor releases', async t => {
  const packageName = 'test-release';
  const owner = 'owner';
  process.env.GL_TOKEN = 'gitlab_token';
  process.env.GITLAB_URL = mockServer.url;
  process.env.GITLAB_PREFIX = '';
  process.env.NPM_TOKEN = 'NPM_TOKEN';
  await writeJson('./package.json', {
    name: packageName,
    version: '0.0.0-dev',
    publishConfig: {registry: npmRegistry.url},
    repository: {url: `https://gitlab.com/${owner}/${packageName}`},
  });

  /* Initial release */
  let version = '1.0.0';
  let verifyGitLabMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}`,
    {},
    {body: {permissions: {project_access: {access_level: 30}}}, method: 'GET'}
  );
  let getRefMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}`,
    {},
    {body: {}, statusCode: 404, method: 'GET'}
  );
  let createReleaseMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}/release`,
    {body: {tag_name: `v${version}`}},
    {body: {}}
  );
  t.log('Commit a feature');
  await gitCommit('feat: new feature');

  t.log('Initial release');
  await semanticRelease({extends: gitlabConfig});

  await mockServer.verify(verifyGitLabMock);
  await mockServer.verify(getRefMock);
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
  getRefMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}`,
    {},
    {body: {}, statusCode: 200, method: 'GET'}
  );
  createReleaseMock = await mockServer.mock(
    `/projects/${owner}%2F${packageName}/repository/tags/v${version}/release`,
    {body: {tag_name: `v${version}`}},
    {body: {}}
  );
  t.log('Commit a feature');
  await execa('git', ['commit', '-m', 'feat: other feature', '--allow-empty', '--no-gpg-sign']);

  t.log('Minor release');
  await semanticRelease({extends: gitlabConfig});

  await mockServer.verify(verifyGitLabMock);
  await mockServer.verify(getRefMock);
  await mockServer.verify(createReleaseMock);
  t.regex(t.context.logs, /Publishing version 1\.1\.0 to npm registry/);
  t.regex(t.context.logs, /Published GitLab release: v1\.1\.0/);
  t.is((await readJson('./package.json')).version, version);
});

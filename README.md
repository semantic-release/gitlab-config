# @semantic-release/gitlab-config

[Semantic-release](https://github.com/semantic-release/semantic-release) shareable config for [GitLab](https://gitlab.com).

[![Travis](https://img.shields.io/travis/semantic-release/gitlab-config.svg)](https://travis-ci.org/semantic-release/gitlab-config)
[![Codecov](https://img.shields.io/codecov/c/github/semantic-release/gitlab-config.svg)](https://codecov.io/gh/semantic-release/gitlab-config)
[![Greenkeeper badge](https://badges.greenkeeper.io/semantic-release/gitlab-config.svg)](https://greenkeeper.io/)

## Usage

### Local installation

```bash
$ npm install --save-dev semantic-release @semantic-release/gitlab-config
```

In `package.json`:

```json
{
  "release": {
    "extends": "@semantic-release/gitlab-config"  
  }
}
```

### Global installation

```bash
$ npm install -g semantic-release @semantic-release/gitlab-config
$ semantic-release -e @semantic-release/gitlab-config
```

## Configuration

### GitLab authentication

The GitLab authentication configuration is **required** and can be set via [environment variables](#environment-variables).

See [GitLab authentication](https://github.com/semantic-release/gitlab#gitlab-authentication).

### Npm registry authentication

The npm authentication configuration is **required** and can be set via [environment variables](#environment-variables).

See [Npm registry authentication](https://github.com/semantic-release/npm#npm-registry-authentication)

### Environment variables

| Variable                     | Description                                                                                                                                 |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `GL_TOKEN` or `GITLAB_TOKEN` | **Required.** The token used to authenticate with GitLab repository.                                                                        |
| `NPM_TOKEN`                  | **Required.** Npm token created via [npm token create](https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens) |

### Additional options

This shareable config uses the [`@semantic-release/npm`](https://github.com/semantic-release/npm) and [`@semantic-release/gitlab`](https://github.com/semantic-release/gitlab) plugins. See the documentation of each plugins for additional options.
Options can be set in the Semantic-release configuration.

For example to set a custom GitLab URL:

```json
{
  "release": {
    "extends": "@semantic-release/gitlab-config",
    "gitlabUrl": "https://custom.gitlab.com"
  }
}
```

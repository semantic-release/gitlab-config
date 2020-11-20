# @semantic-release/gitlab-config

[**semantic-release**](https://github.com/semantic-release/semantic-release) shareable config to publish npm packages with [GitLab](https://gitlab.com).

[![Build Status](https://github.com/semantic-release/gitlab-config/workflows/Test/badge.svg)](https://github.com/semantic-release/gitlab-config/actions?query=workflow%3ATest+branch%3Amaster) [![npm latest version](https://img.shields.io/npm/v/@semantic-release/gitlab-config/latest.svg)](https://www.npmjs.com/package/@semantic-release/gitlab-config)
[![npm next version](https://img.shields.io/npm/v/@semantic-release/gitlab-config/next.svg)](https://www.npmjs.com/package/@semantic-release/gitlab-config)

## Plugins

This shareable configuration use the following plugins:

- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer)
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator)
- [`@semantic-release/npm`](https://github.com/semantic-release/npm)
- [`@semantic-release/gitlab`](https://github.com/semantic-release/gitlab)

## Install

```bash
$ npm install --save-dev semantic-release @semantic-release/gitlab-config
```

## Usage

The shareable config can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "extends": "@semantic-release/gitlab-config"
}
```

## Configuration

See each [plugin](#plugins) documentation for required installation and configuration steps.

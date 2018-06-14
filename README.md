# human-connection-api-nodejs-client
[![Build Status](https://travis-ci.org/demokratie-live/human-connection-api-nodejs-client.svg?branch=master)](https://travis-ci.org/demokratie-live/human-connection-api-nodejs-client)

## Prerequisites
The development environment of this plugin uses the backend APIs of [Human Connection](https://human-connection.org/) and [Democracy](https://www.democracy-deutschland.de/#!start).
If you clone this repository, you have a version of both backend APIs in [/democracy-server](/democracy-server) and [/human-connection-api](/human-connection-api) as [git subtrees](https://git-scm.com/book/en/v1/Git-Tools-Subtree-Merging), respectively.
Follow the installation instructions of both Human Connection API and Democracy API:

https://github.com/demokratie-live/democracy-server
https://github.com/Human-Connection/API


## Installation

Install dependencies with [yarn](https://yarnpkg.com/en/):
```sh
yarn install
```

## Test

Run:
```
yarn test
```

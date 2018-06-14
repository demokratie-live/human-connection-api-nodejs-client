# human-connection-api-nodejs-client
[![Build Status](https://travis-ci.org/demokratie-live/human-connection-api-nodejs-client.svg?branch=master)](https://travis-ci.org/demokratie-live/human-connection-api-nodejs-client)

## Prerequisites
Make sure you have a recent version of [NodeJS](https://nodejs.org/en/) and 
[yarn](https://yarnpkg.com/lang/en/).

## Usage
We're using cucumber-js for testing. Cucumber is a self-documenting testing
framework, so going through the features should give a good idea how to use this
library. E.g. if you want to learn how to create a contribution for an
organization, check out this [feature](/features/usage/resolve_slugs.feature).


## Testing

The development environment of this plugin uses the [backend API](https://www.chromium.org/)
of [Human Connection](https://human-connection.org/) as a git submodule.

Check out the code with:

```sh
git clone --recurse-submodules https://github.com/demokratie-live/human-connection-api-nodejs-client.git
cd human-connection-api-nodejs-client
```

Install dependencies with [yarn](https://yarnpkg.com/en/):

```sh
yarn install
cd API
yarn install
cd ..
```

Starting the backend of Human Connection will create a database configuration if
it does not exist. The default configuration has the database seeder enabled,
which is not what you want for testing. You can avoid the database seeder by
copying a database configuration used on our build server to the backend folder:

```sh
cp local.travis.json API/config/local.json
```

Make sure there is no other HC backend running. Then start the test suite:
```sh
yarn test
```

In our tests we `spawn` an instance of the backend and run tests against it. If
`spawn` does not recognize the location of your local `node` executable, you can
pass an environment variable like this:

```sh
NODE_PATH=$(which node) yarn test
```

## Development

I would suggest that you create a [cucumber-js](https://github.com/cucumber/cucumber-js)
feature before you implement your desired feature. For debugging I set
breakpoints with `debugger` somewhere in the code, run 
```sh
node --inspect node_modules/cucumber/bin/cucumber-js features/your.feature
```
and open the [dedicated DevTools for Node](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27)
in [chromium](https://www.chromium.org/).

When you're done, run:
```sh
yarn lint
```

/* eslint no-unused-expressions: off */
/* eslint func-names: off */
/* eslint no-underscore-dangle: off */
const { Given, When, Then } = require('cucumber');
const fetch = require('node-fetch');
const { expect } = require('chai');
const fs = require('fs-extra');
const { spawnSync } = require('child_process');
const waitOn = require('wait-on');

const hcBackendUrl = 'http://localhost:3030';

let currentUser;
let currentUserPassword;
let httpResponse;
let currentUserAccessToken;
let commandOutput;

function authenticate(email, plainTextPassword) {
  const formData = {
    email,
    password: plainTextPassword,
    strategy: 'local',
  };
  return fetch(`${hcBackendUrl}/authentication`, {
    method: 'post',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' },
  }).then(response => response.json())
    .catch((err) => {
      throw (err);
    })
    .then(json => json.accessToken);
}

function execute(command) {
  const script = command.replace(/node\s*/, '');
  return spawnSync((process.env.NODE_PATH || 'node'), [script], {
    cwd: './tmp/',
  });
}

Given(/^the Human Connection API is up and running(?: on "http:\/\/localhost:3030")?/, (callback) => {
  waitOn({ resources: ['tcp:3030'], timeout: 30000 }, (err) => {
    if (err) throw (err);
    return callback();
  });
});

Given("there is a 3rd party application running, e.g. 'Democracy'", () => {
  // Just documentation
});

Given('there is a user in Human Connection with these credentials:', function (dataTable) {
  const params = dataTable.hashes()[0];
  currentUserPassword = params.password;
  return this.app.service('users').create(params).then((user) => {
    currentUser = user;
  });
});

Given('you am authenticated', () => authenticate(currentUser.email, currentUserPassword).then((accessToken) => {
  currentUserAccessToken = accessToken;
}));

When('you send a POST request to {string} with:', (route, body, callback) => {
  const params = {
    method: 'post',
    body,
    headers: { 'Content-Type': 'application/json' },
  };
  if (currentUserAccessToken) {
    params.headers.Authorization = `Bearer ${currentUserAccessToken}`;
  }
  fetch(`${hcBackendUrl}${route}`, params)
    .then(response => response.json())
    .catch((err) => {
      throw (err);
    })
    .then((json) => {
      httpResponse = json;
      callback();
    });
});

Then('there is an access token in the response:', (jsonResponse) => {
  expect(httpResponse.accessToken).to.be.a('string');
  expect(httpResponse.accessToken.length).to.eq(342);
  const expectedAccessToken = JSON.parse(jsonResponse).accessToken;
  const expectedFirstPartOfJwt = expectedAccessToken.split('.')[0];
  expect(httpResponse.accessToken.split('.')[0]).to.eq(expectedFirstPartOfJwt);
});

Then('a new post is created', function () {
  return this.app.service('contributions').find({}).then((contributions) => {
    expect(contributions.total).to.eq(1);
    expect(contributions.data[0].type).to.eq('post');
  });
});

Given(/^in your script "([^"]+)"/, (path, content, callback) => fs.appendFile(`tmp/${path}`, `\n${content}`, callback));

Given('you have a file {string} with this content:', (path, content) => fs.writeFile(`tmp/${path}`, content));

When(/^you run "(.*)"/, (command) => {
  commandOutput = execute(command);
});

When('you install this library e.g. "yarn add human-connection-api-nodejs-client"', () => {
  const nodeModulesFolder = 'tmp/node_modules';
  fs.ensureDirSync(`${nodeModulesFolder}/human-connection-api-nodejs-client`);
  ['index.js', 'package.json'].forEach((sourceFile) => {
    fs.copySync(sourceFile, `${nodeModulesFolder}/human-connection-api-nodejs-client/${sourceFile}`);
  });
  [
    // 'node_modules/lodash',
    'node_modules/node-fetch',
  ].forEach((sourceDir) => {
    fs.copySync(sourceDir, `tmp/${sourceDir}`);
  });
});

Given('the following users are members of some organization:', function (dataTable, callback) {
  dataTable.hashes().forEach((params) => {
    this.app.service('users').find({ query: { email: params.email } }).then((users) => {
      const organizationAttributes = {
        name: params.organization,
        slug: params.organization,
        userId: users.data[0]._id,
        description: 'Super cool organization!',
        categoryIds: ['5ac7768f8d655d2ee6d48fe4'],
      };
      this.app.service('organizations').create(organizationAttributes).then(callback());
    });
  });
});

Then('a new post is created in the name of the organization {string}', function (name) {
  return this.app.service('organizations').find({ query: { slug: name } }).then((organizations) => {
    const organization = organizations.data[0];
    return this.app.service('contributions').find({}).then((contributions) => {
      expect(contributions.total).to.eq(1);
      expect(contributions.data[0].type).to.eq('post');
      expect(contributions.data[0].organizationId).to.eq(String(organization._id));
    });
  });
});

Then(/you get an (?:.*)?error like this:/, (docString) => {
  const errorMessage = String(commandOutput.output);
  docString.split('\n').forEach((part) => {
    expect(errorMessage).to.contain(part);
  });
  expect(errorMessage.match(/Error:/g)).to.have.lengthOf(2);
});

Given('there is no user in the database', function () {
  return this.app.service('users').find({}).then((users) => {
    expect(users.total).to.eq(0);
  });
});

Given('the user is not a member of the organization {string}', function (name) {
  return this.app.service('organizations').find({ query: { slug: name } }).then((organizations) => {
    if (organizations.total > 0) return true;
    const userAttributes = {
      email: 'someemail@example.org',
      password: '1234',
      isVerified: true,
    };
    return this.app.service('users').create(userAttributes).then((user) => {
      const organizationAttributes = {
        name,
        slug: name,
        userId: user._id,
        description: 'Super cool organization!',
        categoryIds: ['5ac7768f8d655d2ee6d48fe4'],
      };
      return this.app.service('organizations').create(organizationAttributes);
    });
  });
});

Given('debug', () => {
  // eslint-disable-next-line no-debugger
  debugger;
});

Given('there is no organization with that slug', function () {
  return this.app.service('organizations').find({}).then((organizations) => {
    expect(organizations.total).to.eq(0);
  });
});

Given('there is an organization called {string}', function (name) {
  const userAttributes = {
    email: 'someemail@example.org',
    password: '1234',
    isVerified: true,
  };
  return this.app.service('users').create(userAttributes).then((user) => {
    const organizationAttributes = {
      name,
      slug: name,
      userId: user._id,
      description: 'Super cool organization!',
      categoryIds: ['5ac7768f8d655d2ee6d48fe4'],
    };
    return this.app.service('organizations').create(organizationAttributes);
  });
});

Given('you do not have a user account', function () {
  return this.app.service('users').find({}).then((users) => {
    expect(users.total).to.eq(0);
  });
});

Given('you contributed a post with a slug {string} before', function (slug) {
  const contributionAttributes = {
    title: 'Cool title',
    slug,
    content: '<p>A nice content</p>',
    contentExcerpt: 'Nice',
    type: 'post',
    language: 'de',
    categoryIds: ['5ac7768f8d655d2ee6d48fe4'],
    userId: currentUser._id,
  };
  return this.app.service('contributions').create(contributionAttributes);
});

Then('your post with slug {string} is updated', function (slug) {
  return this.app.service('contributions')
    .find({ query: { slug } })
    .then((contributions) => {
      expect(contributions.total).to.eq(1);
      const createdAt = contributions.data[0].createdAt.getTime();
      const updatedAt = contributions.data[0].updatedAt.getTime();
      expect(createdAt).not.to.eq(updatedAt);
    });
});


Then('a post with slug {string} is created', function (slug) {
  return this.app.service('contributions')
    .find({ query: { slug } })
    .then(contributions => expect(contributions.total).to.eq(1));
});

Given(/there is no server running(?: on "http:\/\/localhost:3031")?/, (callback) => {
  // Write code here that turns the phrase above into concrete actions
  waitOn({ resources: ['tcp:3031'], timeout: 30000, reverse: true }, (err) => {
    if (err) throw (err);
    return callback();
  });
});


Given('you call method \'contribute\' with: {string}', (code, callback) => {
  fs.appendFile('tmp/script.js', code, callback);
});

Given('we have these categories in human connection:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  return Promise.all(dataTable.hashes().map(params => this.app.service('categories').create(params)));
});

Then('this post is associated with the category {string}', function (slug) {
  // Write code here that turns the phrase above into concrete actions
  return this.app.service('categories').find({ query: { slug } }).then((categories) => {
    const category = categories.data[0];
    expect(categories.total).to.eq(1);
    return this.app.service('contributions').find({}).then((contributions) => {
      expect(contributions.total).to.eq(1);
      expect(contributions.data[0].type).to.eq('post');
      expect(contributions.data[0].categoryIds).to.include(String(category._id));
    });
  });
});


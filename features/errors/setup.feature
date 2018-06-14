Feature: Getting helpful error messages if something is wrong with your setup
  As a developer
  You want to get meaningful error messages
  To be able to fix errors

  If the current setup of the human connection backend is incorrect, these error
  messages will give you a hint what you did wrong:

  Background:
    Given the Human Connection API is up and running on "http://localhost:3030"
    And you have a file "script.js" with this content:
    """
    const hc = require('human-connection-api-nodejs-client');
    hc.connect('http://localhost:3030');
    let member = new hc.User({
      email: "user@example.com",
      password: "1234"
    });
    member.contribute({
      title: "Cool title",
      content: "<p>A nice content</p>",
      contentExcerpt: "Nice",
      type: "post",
      language: "de",
      categoryIds: ["5ac7768f8d655d2ee6d48fe4"]
    }, {
      resolveSlugs: {
        organization: "democracy",
      }
    });
    """
    And you install this library e.g. "yarn add human-connection-api-nodejs-client"

  Scenario: Cannot find organization with slug "democracy"
    Given there is no organization with that slug
    When you run "node script.js"
    Then you get an error like this:
    """
    Cannot find organization "democracy"
    Error: Not Found
    """

  Scenario: Authentication error
    Given you do not have a user account
    But there is an organization called "democracy"
    When you run "node script.js"
    Then you get an authentication error like this:
    """
    Cannot log in.
    Error: Unauthorized
    """

  Scenario: Authorization error
    Given there is a user in Human Connection with these credentials:
      | email            | password | isVerified |
      | user@example.com |     1234 | true       |
    But the user is not a member of the organization "democracy"
    When you run "node script.js"
    Then you get an authorization error like this:
    """
    Cannot create post.
    Error: Forbidden
    """

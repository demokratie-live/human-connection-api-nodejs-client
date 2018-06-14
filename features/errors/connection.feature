Feature: Getting helpful error messages for an incorrect connection
  As a developer
  You want to get meaningful error messages
  To be able to fix errors

  If the HTTP connection was refused because there is no server running on that
  URL, you will see this error:

  Background:
    Given the Human Connection API is up and running on "http://localhost:3030"
    And you install this library e.g. "yarn add human-connection-api-nodejs-client"
    And you have a file "script.js" with this content:
    """
    const hc = require('human-connection-api-nodejs-client');
    hc.connect('http://localhost:3031');
    let member = new hc.User({});
    """

  Scenario Outline: No server running
    Given there is no server running on "http://localhost:3031"
    And you call method 'contribute' with: "<code>"
    When you run "node script.js"
    Then you get an error like this:
    """
    Is the human connection server running?
    Error: request to http://localhost:3031
    failed, reason: connect ECONNREFUSED 127.0.0.1:3031
    """

    Examples:
      | code                                           |
      | member.contribute({});                         |
      | member.contribute({}, {slug: 'slug'});         |
      | member.contribute({}, {slug: 'organization'}); |

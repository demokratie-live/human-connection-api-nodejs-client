Feature: Using this library to create a contribution
  As a developer of a 3rd party application
  You would like to use this javascript library
  To create e.g. a contribution programmatically

  Background:
    Given the Human Connection API is up and running on "http://localhost:3030"
    And there is a user in Human Connection with these credentials:
      | email            | password | isVerified |
      | user@example.com |     1234 | true       |
    And you install this library e.g. "yarn add human-connection-api-nodejs-client"
    And in your script "script.js" the first lines look like this:
    """
    const hc = require('human-connection-api-nodejs-client');
    hc.connect('http://localhost:3030/');
    let user = new hc.User({
      email: "user@example.com",
      password: "1234"
    });
    let contributionParams = {
      title: "Cool title",
      content: "<p>A nice content</p>",
      contentExcerpt: "Nice",
      type: "post",
      language: "de",
      categoryIds: ["5ac7768f8d655d2ee6d48fe4"] // this id does not even exist
    };                                          // just get around validations
    """

  Scenario: Contribute a post
    Given in your script "script.js" you just call "contribute"
    """
    user.contribute(contributionParams);
    """
    When you run "node script.js"
    Then a new post is created

  Scenario: Duplicate a post by running a script twice
    Given in your script "script.js" you call contribute without a slug
    """
    user.contribute(contributionParams);
    """
    When you run "node script.js"
    And you run "node script.js" again
    Then a post with slug "cool-title1" is created

  Scenario: Update a post with unique slug
    Given you contributed a post with a slug "cool-title" before
    And in your script "script.js" you pass the option "slug" like this:
    """
    user.contribute(contributionParams, {
      slug: "cool-title",
    });
    """
    When you run "node script.js"
    Then your post with slug "cool-title" is updated

  Scenario: Upsert a post by running a script twice, specifying a slug
    Given in your script "script.js" you pass the option "slug" like this:
    """
    user.contribute(contributionParams, {
      slug: "cool-title",
    });
    """
    When you run "node script.js"
    And you run "node script.js" again
    Then your post with slug "cool-title" is updated

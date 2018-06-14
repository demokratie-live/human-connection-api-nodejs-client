Feature: Specify associated records by slug
  As a user of this 3rd party library
  You would like to use slugs for associations when you create contributions
  Because you cannot remember the ids of these associations

  Background:
    Given the Human Connection API is up and running on "http://localhost:3030"
    And there is a user in Human Connection with these credentials:
      | email            | password | isVerified |
      | user@example.com |     1234 | true       |
    And you install this library e.g. "yarn add human-connection-api-nodejs-client"
    And in your script "script.js" the first lines look like this:
    """
    const hc = require('human-connection-api-nodejs-client');
    hc.connect('http://localhost:3030');
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

  Scenario: Post in the name of an organization
    Given the following users are members of some organization:
      | email            | organization | organizationId |
      | user@example.com | democracy    | 1234           |
    And in your script "script.js" you specify the id of the organization "democracy":
    """
    let member = user;
    member.contribute(contributionParams, {
      resolveSlugs: {
        organization: 'democracy'
      }
    });
    """
    When you run "node script.js"
    Then a new post is created in the name of the organization "democracy"

  Scenario: Specify the category by slug
    Given we have these categories in human connection:
      | title    | slug    |
      | Testing  | testing |
    And in your script "script.js" you specify the category "Testing" via slug:
    """
    let member = user;
    member.contribute(contributionParams, {
      resolveSlugs: {
        categories: ['testing']
      }
    });
    """
    When you run "node script.js"
    Then a new post is created
    And this post is associated with the category "testing"

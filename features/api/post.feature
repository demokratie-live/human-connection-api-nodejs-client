Feature: Import a post from an organization and publish it in Human Connection
  As an organization like e.g. "Democracy"
  you would like to publish a post under the organization's credentials
  In order to create awareness in Human Connection for my organization


  Background:
    Given the Human Connection API is up and running
    And there is a user in Human Connection with these credentials:
      | email            | password |
      | user@example.com |     1234 |

  Scenario: Get a JWT token
    When you send a POST request to "/authentication" with:
    """
    {
      "email": "user@example.com",
      "password": "1234",
      "strategy": "local"
    }
    """
    Then there is an access token in the response:
    """
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyIsInR5cGUiOiJhY2Nlc3MifQ..."
    }
    """

  Scenario: Publish a post
    Given you am authenticated
    When you send a POST request to "/contributions" with:
    """
    {
      "title": "Cool title",
      "content": "<p>A nice content</p>",
      "contentExcerpt": "Nice",
      "type": "post",
      "language": "de",
      "categoryIds": ["5ac7768f8d655d2ee6d48fe4"]
    }
    """
    Then a new post is created

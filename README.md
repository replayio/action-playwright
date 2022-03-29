# `replayio/action-playwright`

> Record your failed [Playwright](https://playwright.dev) tests with [Replay](https://replay.io)

## Usage

1. Log into [app.replay.io](https://app.replay.io)
2. Create a [Team API key](https://docs.replay.io/docs/setting-up-a-team-f5bd9ee853814d6f84e23fb535066199#4913df9eb7384a94a23ccbf335189370) (Personal API keys can be used, but have a limit of 10 recordings)
3. Store the API key as a [GitHub Repository Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `RECORD_REPLAY_API_KEY`
4. Add the configuration below to your existing workflow (or start a new one with the [complete example](#complete-workflow-example) below)

```yaml
- uses: replayio/action-playwright@v0.2.0
  with:
    apiKey: ${{ secrets.RECORD_REPLAY_API_KEY }}
    issue-number: ${{ github.event.pull_request.number }}
    project: replay-firefox
```

## Arguments

Required | Name | Description | Default
-------- | ---- | ----------- | -------
:white_check_mark: | `apiKey` | The Replay API Key used to upload recordings
&nbsp; | `issue-number` | The number of the pull request to comment with failed test links | 
&nbsp; | `project` | The `@playwright/test` project to run
&nbsp; | `public` | When true, make replays public on upload | `false`
&nbsp; | `command` | The command to run your playwright tests | `npx playwright test`
&nbsp; | `working-directory` | The relative working directory for the app | `.`
&nbsp; | `upload-all` | Upload all recordings instead of only recordings of failed tests | `false`

> **Note:** This action appends arguments to your `command` to configure a
> custom reporter. If you're using a command like `npm` to run `playwright
> test`, you may need to include `--` at the end to allow those arguments to
> pass to Playwright.

## Complete Workflow Example
        
```yaml
# .github/workflow/ci.yml
name: Playwright Tests
on:
  pull_request:

jobs:
  playwright-tests:
    name: Playwright tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bahmutov/npm-install@v1
        # with:
        #   working-directory: .
      - uses: replayio/action-playwright@v0.2.0
        with:
          # An optional command to run your tests.
          command: npx playwright test
          # When true, replays will be accessible to anyone with the link.
          # This is useful for open source projects that want to collaborate
          # with external users.
          public: true
          # When set, the action will comment on the PR with links to
          # replays of any failed tests.
          issue-number: ${{ github.event.pull_request.number }}
          # The `@playwright/test` project to use. This should point to a project
          # that uses a Replay runtime.
          project: replay-firefox
          # An API key (usually a Team API Key) to use to upload replays.
          # Configure this via GitHub repo settings.
          apiKey: ${{ secrets.RECORD_REPLAY_API_KEY }}
          # An optional working directory which is useful if the project being
          # tested resides in a subdirectory of the repository
          working-directory: .
```
const fetch = require("node-fetch");

async function getWorkspaceId(apiKey) {
  try {
    const resp = await fetch("https://api.replay.io/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        variables: {},
        query: `
          query GetWS {
            viewer {
              user {
                id
              }
            }
            auth {
              workspaces {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const json = await resp.json();

    if (json.errors) {
      throw new Error(errors[0].message);
    } else if (!json.data) {
      throw new Error("No data was returned");
    } else if (json.data.user) {
      return new Error("Unable to return a team for a user API Key");
    }

    const workspaces = json.data.auth.workspaces.edges;
    if (workspaces.length !== 1) {
      // This shouldn't happen because API keys belong to a single workspace
      throw new Error("Multiple teams returned for the provided API key");
    }

    return workspaces[0].node.id;
  } catch (e) {
    console.log((e && e.message) || "Unexpected error retrieving team ID");
    return null;
  }
}

async function comment({
  apiKey,
  github,
  context,
  issue_number,
  recordings,
  uploadAll,
  source,
  testRunId,
}) {
  const {
    repo: { owner, repo },
  } = context;

  if (!issue_number) {
    console.log("No issue number");
    return;
  }

  if (!recordings || recordings.length === 0) {
    console.log("No recordings created");
    return;
  }

  const count =
    recordings.length === 1
      ? "**1 replay**"
      : `**${recordings.length} replays**`;
  const upload = uploadAll
    ? ""
    : recordings.length === 1
    ? " of a failed test"
    : " of failed tests";
  const sourceText = source ? ` from **${source}**` : "";

  let testRunMessage = "";
  if (apiKey && testRunId) {
    const workspaceId = await getWorkspaceId(apiKey);
    if (workspaceId) {
      testRunMessage = ` or you can view the [entire test run](https://app.replay.io/team/${workspaceId}/test-run/${testRunId}) on Replay`;
    }
  }

  return github.rest.issues.createComment({
    issue_number,
    owner,
    repo,
    body: `# [![logo](https://static.replay.io/images/logo-horizontal-small-light.svg)](https://app.replay.io)

:wave: Hey there! We uploaded ${count}${upload}${sourceText} linked below${testRunMessage}.


${recordings
  .map(
    ({ id, metadata: { title } }) =>
      `* [${title || id}](https://app.replay.io/recording/${id})`
  )
  .join("\n")}`,
  });
}

module.exports = comment;

const fetch = require("node-fetch");

async function getWorkspaceId(apiKey) {
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

  if (json.errors || !json.data || json.data.user) {
    return null;
  }

  const workspaces = json.data.auth.workspaces.edges;
  if (workspaces.length !== 1) {
    return null;
  }

  return workspaces[0].id;
}

async function comment({apiKey,  github, context, issue_number, recordings, uploadAll, source, testRunId}) {
  const {
    repo: {owner, repo},
  } = context;

  if (!issue_number) {
    console.log('No issue number');
    return;
  }

  if (!recordings || recordings.length === 0) {
    console.log('No recordings created');
    return;
  }

  const count = recordings.length === 1 ? '**1 replay**' : `**${recordings.length} replays**`;
  const upload = uploadAll ? '' : recordings.length === 1 ? ' of a failed test' : ' of failed tests';
  const sourceText = source ? ` from **${source}**` : '';

  let testRunMessage = "";
  if (apiKey && testRunId) {
    const workspaceId = await getWorkspaceId(apiKey);
    if (workspaceId) {
      testRunMessage = `View the [entire test run](https://app.replay.io/team/${workspaceId}/test-run/${testRunId}) on Replay.`;
    }
  }

  return github.rest.issues.createComment({
    issue_number,
    owner,
    repo,
    body: `# [![logo](https://static.replay.io/images/logo-horizontal-small-light.svg)](https://app.replay.io)

:wave: Hey there!

${testRunMessage}

We uploaded ${count}${upload}${sourceText}.

${recordings
  .map(
    ({id, metadata: { title } }) => `* [${title || id}](https://app.replay.io/recording/${id})`
  )
  .join('\n')}`,
  });
}

module.exports = comment;

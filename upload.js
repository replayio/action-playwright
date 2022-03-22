async function upload(cli) {
  const allRecordings = cli.listAllRecordings();
  const failedRecordings = allRecordings.filter(
    (r) => r.metadata.testStatus === "failed"
  );

  console.log(JSON.stringify(allRecordings, undefined, 2));

  console.log(
    "Found",
    failedRecordings.length,
    "failed recordings of",
    allRecordings.length,
    "total recordings"
  );

  let failed = [];
  for await (let r of failedRecordings) {
    try {
      await cli.uploadRecording(r.id, { verbose: true });
    } catch (e) {
      failed.push(e.message);
    }
  }

  failed.forEach((reason) => {
    console.error("Failed to upload replay:", reason);
  });
}

async function makeReplaysPublic(axios, apiKey, recordings) {
  const results = await Promise.allSettled(
    recordings.map((r) =>
      axios({
        url: "https://api.replay.io/v1/graphql",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        data: {
          query: `
            mutation MakeReplayPublic($recordingId: ID!, $isPrivate: Boolean!) {
              updateRecordingPrivacy(input: { id: $recordingId, private: $isPrivate }) {
                success
              }
            }
          `,
          variables: {
            recordingId: r.id,
            isPrivate: false,
          },
        },
      })
    )
  );

  results.forEach((r) => {
    if (r.status === "rejected") {
      console.error("Failed to mark replay public", r.reason);
    }
  });
}

function getUploadedRecordings(cli) {
  return cli
    .listAllRecordings()
    .filter((r) => r.status === "uploaded")
    .map((r) => ({ id: r.recordingId, title: r.metadata.title }));
}

async function uploadFailedRecordings({ require, apiKey, public = false }) {
  try {
    const cli = require("@replayio/replay");
    const axios = require("axios");

    await upload(cli);
    const uploaded = getUploadedRecordings(cli);

    if (public) {
      await makeReplaysPublic(axios, apiKey, uploaded);
    }

    return uploaded;
  } catch (e) {
    console.error("Failed to upload recordings");
    console.error(e);

    return [];
  }
}

module.exports = uploadFailedRecordings;

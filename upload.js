async function uploadFailedRecordings({require}) {
  const cli = require("@recordreplay/recordings-cli")

  const recordings = cli
    .listAllRecordings()
    .filter((r) => r.metadata.testStatus === 'failed');

  const results = await Promise.allSettled(recordings.map(r => cli.uploadRecording(r.id, {verbose: true})));

  results.forEach(r => {
    if (r.status === "rejected") {
      console.error("Failed to upload replay:", r.reason);
    }
  });
  
  return cli
    .listAllRecordings()
    .filter((r) => r.status === 'uploaded')
    .map(r => ({id: r.recordingId, title: r.metadata.title}));
}

module.exports = uploadFailedRecordings;

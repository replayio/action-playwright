function comment({github, context, issue_number, recordings, uploadAll, source}) {
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

  return github.rest.issues.createComment({
    issue_number,
    owner,
    repo,
    body: `# [![logo](https://static.replay.io/images/logo-horizontal-small-light.svg)](https://app.replay.io)

:wave: Hey there! We uploaded ${count}${upload}${sourceText}.

${recordings
  .map(
    ({id, metadata: { title } }) => `* [${title || id}](https://app.replay.io/recording/${id})`
  )
  .join('\n')}`,
  });
}

module.exports = comment;

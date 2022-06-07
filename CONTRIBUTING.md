# Release Process

1. Update the version in `package.json` using semantic versioning. If the update is due to a downstream dependency update (e.g. a change in `action-upload`), update the version requested in `action.yml` as well.
2. Run `npm run tag` to refresh the package lock and add a version commit and tag
3. `git push --atomic origin main <tag>` to push the tag
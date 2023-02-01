# Contributing guidelines

<!-- vim-markdown-toc GFM -->

- [Development](#development)
  - [System prerequisites](#system-prerequisites)
  - [Dev environment set up](#dev-environment-set-up)
- [Pull requests](#pull-requests)
- [Merging to main](#merging-to-main)
  - [Stages: Draft and Ready for review](#stages-draft-and-ready-for-review)

<!-- vim-markdown-toc -->

## Development

### System prerequisites

This project requires:

- [docker](https://docs.docker.com/get-docker/)
- [nodejs LTS (18)](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Optional:

- [Use a node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)

### Dev environment set up

```bash
# Create an .env based on the example
$ cp .env.example .env

# Start MySQL in docker
$ docker compose up -d
# Wait for the db to finish starting, it takes a few seconds before it's ready...

# Install all dependencies
$ npm install

# Setup the database
$ npm run setup

# Generate a build folder the first time running the app
$ npm run build

# Start the app, which will be running on localhost:3000
$ npm run dev

# Visually see the database in a GUI:
$ npm run db:studio
```

> **Note** `npm run setup` creates a local `mysql-data/` directory, and is a one time setup. That directory can be safely deleted if the database needs to be reset, or if errors occur during database startup.

> **Note** `npm run build` needs to be executed the first time running the project. As it generates a `build/server.js` script that `npm run dev` depends on. Subsequent times, only `npm run dev` is needed to run the app in development mode.

## Pull requests

- To avoid duplicate work, create a draft pull request.
- Avoid cosmetic changes to unrelated files in the same commit.
- Use a [feature branch](https://www.atlassian.com/git/tutorials/comparing-workflows) instead of the main branch.

## Merging to main

For maintainers: when a PR is ready to merge to main,

- always Squash and Merge all PRs. This is so we do not loose the commit history in the PR it self. So if we ever need to debug a feature PR, we have a commit history to reference. This also servers to keep history on main clean.

![squash_and_merge](img/squash_and_merge.png)

### Stages: Draft and Ready for review

Pull requests have two stages: Draft and Ready for review.

1. Create a Draft PR while you are not requesting feedback as you are still working on the PR.
   - You can skip this if your PR is ready for review.
2. Change your PR to ready when the PR is ready for review.
   - You can convert back to Draft at any time.

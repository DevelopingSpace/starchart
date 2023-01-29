# Developer guidelines

<!-- vim-markdown-toc GFM -->

- [Development](#development)
  - [Dev environment set up](#dev-environment-set-up)
- [Pull requests](#pull-requests)
  - [Stages: Draft and Ready for review](#stages-draft-and-ready-for-review)

<!-- vim-markdown-toc -->

## Development

### Dev environment set up

```bash
# Create an .env based on the example
$ cp .env.example .env

# Start MySQL in docker
$ docker compose up -d
# Wait for the db to finish starting, it takes a few seconds before it's ready...

# Setup the database
$ npm run setup

# Start the app, which will be running on localhost:3000
$ npm run dev

# Visually see the database in a GUI:
$ npm run db:studio
```

Note `npm run setup` creates a local `mysql-data/` directory, and is a one time setup. That directory can be safely deleted if the database needs to be reset, or if errors occur when starting the database.

## Pull requests

- To avoid duplicate work, create a draft pull request.
- Avoid cosmetic changes to unrelated files in the same commit.
- Use a feature branch instead of the master branch.

### Stages: Draft and Ready for review

Pull requests have two stages: Draft and Ready for review.

1. Create a Draft PR while you are not requesting feedback as you are still working on the PR.
   - You can skip this if your PR is ready for review.
2. Change your PR to ready when the PR is ready for review.
   - You can convert back to Draft at any time.

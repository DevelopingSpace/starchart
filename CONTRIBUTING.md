# Contributing

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Node.js v22 LTS](https://nodejs.org/en/download/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (Comes with Node.js)

We recommend using a Node.js version manager:

- [nvm](https://github.com/nvm-sh/nvm) (Linux, MacOS, WSL)
- [fnm](https://github.com/Schniz/fnm) (Linux, MacOS, Windows)

## Development setup

1. Create an .env based on the example

   ```bash
   cp .env.example .env
   ```

2. Install and use the project's supported Node.js version

   nvm:

   ```bash
   nvm install
   ```

   fnm:

   ```bash
   fnm install
   ```

3. Start backing services with Docker - MySQL, Redis, Route53, a Let's Encrypt server, Mailhog, and a SAML IDP

   ```bash
   npm run docker
   ```

   Wait for the services to finish starting, it takes a few seconds before they're ready.

4. Install all dependencies

   ```bash
   npm install
   ```

5. Setup the database

   ```bash
   npm run setup
   ```

6. Setup the test database. This is required for running tests locally.

   ```bash
   npm run setup:test
   ```

7. When running the app for the first time, generate a build folder. This generates a `build/server.js` script that `npm run dev` depends on.

   ```bash
   npm run build
   ```

8. Start the app, which will be running on localhost:8080

   ```bash
   npm run dev
   ```

9. When done, stop and remove containers

   ```bash
   docker compose down
   ```

## Testing

### End-to-end testing

We use [Playwright](https://playwright.dev/) for end-to-end testing. For a brief overview of how to use Playwright, you can also go to our [wiki page](https://github.com/DevelopingSpace/starchart/wiki/Playwright).

#### Debugging failures in CI

Playwright is configured to generate a report for test failures. This report is available to download from the GitHub Actions Summary page for the failed test run, and contains video(s) and trace(s) of the failed test(s).

See [our wiki page for information about how to download and use this report](https://github.com/DevelopingSpace/starchart/wiki/Playwright#debugging-ci-failures).

## View the database

You can use Prisma Studio, a visual editor for the data in the database, with:

Development database:

```bash
npm run db:studio
```

Test database:

```bash
npm run db:studio:test
```

## Reset the database

`npm run setup` creates a local `docker/volumes/mysql-data/` directory, and is a one time setup. That directory can be safely deleted if the database needs to be reset, or if errors occur during database startup.

## SAML authentication in development

The development SAML IDP is configured with a few default accounts for testing. The usernames and passwords are:

| user     | pass      |
| -------- | --------- |
| user1    | user1pass |
| user2    | user2pass |
| user3    | user3pass |
| han.solo | starchart |

These can be configured in `./config/simplesamlphp-users`.

## Configuring environment variables and secrets (`.env` and `dev-secrets/`)

Some application configuration is managed via environment variables, and some via secrets (i.e., files).

Your `.env` file should define any environment variables you want to use via `process.env`. For example, the line `MY_ENV_VAR=data` in `.env` will mean that `process.env.MY_ENV_VAR` is available at runtime with `data` as its value.

For secrets, we use [docker-secret](https://github.com/hwkd/docker-secret) to load and expose secrets via Docker Swarm's [secrets](https://docs.docker.com/engine/swarm/secrets/), which are files that get mounted into the container at `/run/secrets/`.

### Using custom secrets

In development, you can override the Docker secrets used by the app with your own by adding `SECRETS_OVERRIDE=1` to your `.env` file. This will load secrets from the `dev-secrets/` directory instead of using Docker Swarm secrets. The `dev-secrets/` folder contains files exposed as secrets to the running app.

To add a secret, for example, a secret named `MY_SECRET` with a value of `this-is-secret`:

1. Create a new file at `dev-secrets/MY_SECRET` with the contents `this-is-secret`.
2. In your code, import secrets with `import secrets from '~/lib/secrets.server'`.
3. In your code, use your secret with `secrets.MY_SECRET`.

## Workflow

Please follow the [GitHub flow][] for contributions:

1. **Update your local main branch**

   ```bash
   git switch main
   git pull --prune
   ```

   Switch to your main branch and pull the latest changes from the remote repository. The `--prune` option removes any references to branches that no longer exist on the remote.

2. **Create a new branch from main**

   ```bash
   git switch -c <issue-number> main
   ```

   Name your branch following the convention `issue-number` (e.g., `issue-1`). If no issue exists for the change you are making, you should [create one][Create an issue], unless the change is really quick or small.

3. **Make your changes, commit, and push**

   You should commit your changes as you're making them. Commit often - smaller commits are generally better. Ideally, each commit contains an isolated, complete change. This makes it easy to revert your changes if you decide to take a different approach. Avoid cosmetic changes to unrelated files in the same commit. If introducing new code, add tests for your changes.

   i. **Review your changes:** Check which files have been changed.

   ```bash
   git status
   ```

   ii. **Stage your changes:** Add the relevant files to the index.

   ```bash
   git add <files>
   ```

   iii. **Commit your changes:** Give each commit a descriptive message to help you and future contributors understand what changes the commit contains.

   ```bash
   git commit -m "<commit message>"
   ```

   iv. **Push your branch:** Push your changes and set the upstream branch.

   ```bash
   git push -u origin <your-branch-name>
   ```

   After you do this for the first time for your branch, your branch now exists on the remote repository, and commits can be pushed with `git push`.

   v. **Create a draft pull request:** [Create a draft pull request][] on GitHub to let others know you're working on the issue and to request feedback on your work as you're working on it. Link your pull request to the issue using [closing keywords][]:

   ```txt
   Fixes #[issue number]
   ```

   vi. Continue making changes, committing them, and pushing them until your changes are ready for review.

4. **Mark your pull request ready for review**

   Once your changes are ready for review, in the merge box, click Ready for review.

   ![ready-for-review-button](https://docs.github.com/assets/cb-62675/mw-1440/images/help/pull_requests/ready-for-review-button.webp)

5. **For maintainers: Remember to squash and merge**

   Squash and merge pull requests to keep a clean commit history on the main branch.

## Resources

- [How to Contribute to Open Source][]
- [Using Pull Requests][]
- [GitHub Docs][]

[GitHub flow]: https://docs.github.com/en/get-started/using-github/github-flow
[Create an issue]: https://github.com/DevelopingSpace/starchart/issues/new
[Create a draft pull request]: https://github.com/DevelopingSpace/starchart/compare
[closing keywords]: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
[How to Contribute to Open Source]: https://opensource.guide/how-to-contribute/
[Using Pull Requests]: https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-requests
[GitHub Docs]: https://docs.github.com/

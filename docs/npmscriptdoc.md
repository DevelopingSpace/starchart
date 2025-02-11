# NPM Scripts

# Contents

- [Build Scripts](#build-scripts)
- [Development Scripts](#development-scripts)
- [Database Scripts](#database-scripts)
- [Setup Scripts](#setup-scripts)
- [Startup Scripts](#start-scripts)
- [Tester Scripts](#testing-scripts)
- [Miscellaneous](#miscellaneous)

## Build Scripts

### `build`: `run-s build:*`

Runs all `build:` scripts (i.g., [build:remix](#buildremix-remix-build) and [build:server](#buildserver-esbuild---platformnode---formatcjs-serverts---outdirbuild---bundle)).

### `build:remix`: `remix build`

Builds the Remix application into the `/build` folder.

### `build:server`: `esbuild --platform=node --format=cjs ./server.ts --outdir=build --bundle`

Bundles and minifies the server with the following arguments:

- `--platform=node`: Specifies the platform as Node.js.
- `--format=cjs`: Outputs CommonJS format.
- `./server.ts`: [Entry point](../server.ts).
- `--outdir=build`: Outputs to `/build` directory.
- `--bundle`: Includes dependencies in the output file.

## Development Scripts

### `predev`: `npm run build:server`

Runs the [build:server](#buildserver-esbuild---platformnode---formatcjs-serverts---outdirbuild---bundle) script before development starts.

### `dev`: `cross-env NODE_ENV=development SECRETS_OVERRIDE=1 run-p dev:remix dev:server:delay`

- Sets environment variables.
- Runs [dev:remix](#devremix-remix-watch) and [dev:server:delay](#devserverdelay-run-s-delay-devserver) concurrently.

### `dev:build`: `npm run build:server -- --watch`

Runs [build:server](#buildserver-esbuild---platformnode---formatcjs-serverts---outdirbuild---bundle) with `--watch` to rebuild on file changes.

### `delay`: `node -e "setTimeout(() => process.exit(0), 3000)"`

Waits 3 seconds before proceeding.

### `dev:remix`: `remix watch`

Builds the Remix server into the `/build` folder and watches for changes.

### `dev:server:delay`: `run-s delay dev:server`

Runs `delay` (wait 3 seconds) before starting [dev:server](#devserver-node---inspect---require-node_modulesdotenvconfig-buildserverjs).

### `dev:server`: `node --inspect --require ./node_modules/dotenv/config ./build/server.js`

Runs `server.js` from the `/build` folder with debugging enabled.

- `--inspect`: Enables debugging tools.
- `--require`: Preloads the dotenv config.

## Database Scripts

### `db:generate`: `prisma generate`

Generates the Prisma client.

### `db:push`: `prisma db push`

Pushes the Prisma schema state to the database.

### `db:seed`: `prisma db seed`

Seeds the database with sample data.

### `db:reset`: `prisma migrate reset`

Resets the database by:

1. Dropping/resetting the schema.
2. Creating a new schema (if dropped).
3. Applying migrations.
4. Running the seed script ([db:seed](#dbseed-prisma-db-seed)).

### `db:migration`: `cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart' prisma migrate dev --create-only --skip-seed`

Creates a migration without applying it or seeding the database.

### `db:format`: `prisma format`

Formats the Prisma schema file.

### `db:studio`: `prisma studio`

Provides an interactive UI for database management.

### `db:studio:test`: `cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' prisma studio`

Runs Prisma Studio with the test database.

## Setup Scripts

### `setup`: `run-s db:generate db:push db:seed`

Runs database setup scripts ([db:generate](#dbgenerate-prisma-generate), [db:push](#dbpush-prisma-db-push), [db:seed](#dbseed-prisma-db-seed)).

### `setup:test`: `cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' run-s db:generate db:push`

Sets environment variables and runs [db:generate](#dbgenerate-prisma-generate) and [db:push](#dbpush-prisma-db-push) for testing.

## Start Scripts

### `start`: `cross-env NODE_ENV=production node ./build/server.js`

Starts the server in production mode.

### `start:e2e`: `cross-env NODE_ENV=test node --require dotenv/config ./build/server.js`

Starts the server in test mode with dotenv configuration preloaded.

## Testing Scripts

### `test`: `cross-env SECRETS_OVERRIDE=1 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' NODE_OPTIONS=--require=dotenv/config vitest`

Runs Vitest for application testing.

### `test:coverage`: `cross-env SECRETS_OVERRIDE=1 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' NODE_OPTIONS=--require=dotenv/config vitest run --coverage`

Runs Vitest with code coverage enabled.

### `e2e`: `cross-env NODE_ENV=test PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test dev http://localhost:8080 "playwright test --ui"`

Runs Playwright tests in interactive mode.

### `test:e2e:dev`: `cross-env PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test dev http://localhost:8080 "playwright test"`

Runs Playwright tests with environment variables.

### `pretest:e2e:run`: `cross-env NODE_ENV=test SECRETS_OVERRIDE=1 run-s build`

Sets environment variables and runs [build](#build-run-s-build) before e2e tests.

### `test:e2e:run`: `cross-env NODE_ENV=test SECRETS_OVERRIDE=1 PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test start:e2e http://localhost:8080 "playwright test"`

Starts the test server and runs Playwright tests.

### `validate`: `run-p "test -- --run" lint typecheck test:e2e:run`

Runs tests, linting, type checking, and e2e tests.

## Miscellaneous

### `typecheck`: `tsc`

Runs TypeScript type checking.

### `prepare`: `husky install`

Installs Husky for managing Git hooks.

### `docker`: `docker-compose up -d`

Starts containers defined in [docker-compose.yml](../docker-compose.yml).

### `lint`: `oxlint .`

Runs the linter on the entire project.

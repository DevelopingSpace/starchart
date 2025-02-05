# Npm Scripts

## build": "run-s build:\*"

Runs all build: scripts (I.e build:remix and build:server)

## "build:remix": "remix build"

Builds the remix server into /build folder

## "build:server": "esbuild --platform=node --format=cjs ./server.ts --outdir=build --bundle"

Bundles and minifies the server with arguments
--platform=node: Specifies platform to be node as opposed to browser or neutral
--format=cjs: Specifies the output file(s) to be in cjs rather than esm or iife
./server.ts: Specifies the entry point
--outdir=build: Specifies output directory to be /build
--bundle: Puts dependencies directly into output file

## "predev": "npm run build:server"

Runs the build:server

## "dev": "cross-env NODE_ENV=development SECRETS_OVERRIDE=1 run-p dev:remix dev:server:delay"

Sets enviornment variables
Runs dev:remix and server:delay

## "dev:build": "npm run build:server -- --watch"

Runs build:server command but with --watch tagged onto actual command
--watch: Makes esbuild watch for changes and rebuild

## "delay": "node -e \"setTimeout(() => process.exit(0), 3000)\""

Uses node to delay for 3 seconds

## "dev:remix": "remix watch"

Builds remix server into build folder but watches for changes and rebuilds

## "dev:server:delay": "run-s delay dev:server"

Runs delay(wait 3 seconds) and dev:server

## "dev:server": "node --inspect --require ./node_modules/dotenv/config ./build/server.js",

Runs server.js from build folder and loads the dotenv config file.
--inspect: Allows dev tools to debug
--require: Preloads a module (dotenv config)

## "docker": "docker-compose up -d",

Runs the docker-compose.yml to run multiple containers
Command ran in dev setup

## "lint": "oxlint .",

Runs the linter

## "db:generate": "prisma generate",

Generates a prisma client for project

## "db:push": "prisma db push",

Pushes state of prisma schema to database

## "db:seed": "prisma db seed",

Seeds database/Recreates database with sample data

## "db:reset": "prisma migrate reset",

Resets the database i.e

1. Drops or soft reset schema
2. Create new schema if dropped
3. Applies migration
4. Runs seed script (i.e db:seed)

## "db:migration": "cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart' prisma migrate dev --create-only --skip-seed",

Creates migration without seeding and without applying migration

1. Reruns migration history in shadow database to check for schema drift
2. Applies pending migration to shadow database
3. Generates migration from any new changes

## "db:format": "prisma format",

Formats schema file

## "db:studio": "prisma studio",

Allows for interacting with database interactively

## "db:studio:test": "cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' prisma studio",

Creates interactive database

## "setup": "run-s db:generate db:push db:seed",

Runs db:generate, db:push, and db:seed
I.e Generates prisma client for project, pushes schema to client, seeds/generate data for client

## "setup:test": "cross-env DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' run-s db:generate db:push",

Sets enviornment variables and runs db:generate and db:push
I.e generates prisma client and pushes schema

## "start": "cross-env NODE_ENV=production node ./build/server.js",

Starts up server.js in /build folder with enviornment variable

## "start:e2e": "cross-env NODE_ENV=test node --require dotenv/config ./build/server.js",

Starts up server in build folder
--require: Preloads dotenv config file

## "test": "cross-env SECRETS_OVERRIDE=1 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' NODE_OPTIONS=--require=dotenv/config vitest",

Runs vitest/tests application

## "test:coverage": "cross-env SECRETS_OVERRIDE=1 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' NODE_OPTIONS=--require=dotenv/config vitest run --coverage",

Runs vitest but with coverage tag

## "e2e": "cross-env NODE_ENV=test PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test dev http://localhost:8080 \"playwright test --ui\"",

Runs playwright test with enviornment in interactive mod mode

## "test:e2e:dev": "cross-env PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test dev http://localhost:8080 \"playwright test\""

Runs playwright test with enviornment variables

## "pretest:e2e:run": "cross-env NODE_ENV=test SECRETS_OVERRIDE=1 run-s build",

Sets enviornment variables and runs build command

## "test:e2e:run": "cross-env NODE_ENV=test SECRETS_OVERRIDE=1 PORT=8080 DATABASE_URL='mysql://root:root_password@127.0.0.1:3306/starchart_test' start-server-and-test start:e2e http://localhost:8080 \"playwright test\"",

Runs start:e2e which starts up the server then runs palywright tests

## "typecheck": "tsc",

Checks types in project to make sure they match

## "validate": "run-p \"test -- --run\" lint typecheck test:e2e:run"

Runs test with --run put into it, typecheck, and test:e2e:run/playwright's end to end tests

## "prepare": "husky install"

Sets up husky/githooks

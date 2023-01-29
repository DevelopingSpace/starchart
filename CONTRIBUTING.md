# Contributing guidelines

<!-- vim-markdown-toc GFM -->

- [Development](#development)
  - [Dev environment set up](#dev-environment-set-up)

<!-- vim-markdown-toc -->

## Development

### Dev environment set up

```sh
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

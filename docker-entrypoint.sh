#!/bin/bash
set -eo pipefail

# Run the necessary commands to sync the Prisma schema
# with the database. We pull the database URL out of
# secrets, since Prisma requires it as an env var.
database_setup() {
  echo "Running database setup..."
  DATABASE_URL=$(</run/secrets/DATABASE_URL)
  export DATABASE_URL

  npx prisma db push

  # Clear the DATABASE_URL from the env. The app uses it via secrets
  unset DATABASE_URL
  echo "Database setup complete"
}

# See if we need to do database setup before starting.
if [[ $DATABASE_SETUP == "1" ]]; then
  # Run our database setup
  database_setup
fi

# Run the app normally, switching to the node process as PID 1
exec "$@"

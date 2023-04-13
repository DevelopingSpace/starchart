#!/bin/bash
set -eo pipefail

# Run the necessary commands to sync the Prisma schema
# with the database. We pull the database URL out of
# secrets, since Prisma requires it as an env var.
database_setup() {
  echo "Running database reset and setup..."
  DATABASE_URL=$(</run/secrets/DATABASE_URL)
  export DATABASE_URL

  # Wipes existing database and apply migration files
  # See:https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model
  npx prisma migrate reset --force --skip-seed

  # Clear the DATABASE_URL from the env. The app uses it via secrets
  unset DATABASE_URL
  echo "Database setup complete"
}

database_migration() {
  echo "Running database migration..."
  DATABASE_URL=$(</run/secrets/DATABASE_URL)
  export DATABASE_URL

  # Deploy migration files to change schema without deleting the data
  # See:https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model
  npx prisma migrate deploy

  # Clear the DATABASE_URL from the env. The app uses it via secrets
  unset DATABASE_URL
  echo "Database migration complete"
}

# Clear all keys from Redis, which will clean out
# any old worker queues that reference rows in
# the database.
clear_redis() {
  echo "Running redis cleanup for redis://redis:6379..."

  # Use the `redis` Docker host
  npx redis-cli -h redis FLUSHDB

  echo "Redis cleanup complete"
}

# See if we need to do database setup before starting.
if [[ $DATABASE_SETUP == "1" ]]; then
  # Run our database setup
  database_setup
  # Clear Redis keys
  clear_redis

# Otherwise, just run our database migration
else
  database_migration
fi

# Run the app normally, switching to the node process as PID 1
exec "$@"

#!/bin/bash
set -eo pipefail

# For initial setup, or to completely recreate the database.
# ALL DATA WILL BE LOST!
# Run the necessary commands to sync the Prisma schema
# with the database by wiping the existing database and 
# applying migration files.
# See: https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model
danger_database_wipe_reinitialize() {
  # We pull the database URL out of secrets, since Prisma requires 
  # it as an env var.
  echo "Running database reset and setup..."
  DATABASE_URL=$(</run/secrets/DATABASE_URL)
  export DATABASE_URL

  # Wipes the existing database and apply migration files
  npx prisma migrate reset --force --skip-seed

  # Clear the DATABASE_URL from the env. The app uses it via secrets
  unset DATABASE_URL
  echo "Database setup complete"
}

# For normal database updates, where applying migrations is enough,
# assuming no changes to the database schema is done without Prisma migration.
# Run the necessary commands to sync the Prisma schema with
# the database by applying migration files.
# See: https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model
database_migration() {
  # We pull the database URL out of secrets, since Prisma requires 
  # it as an env var.
  echo "Running database migration..."
  DATABASE_URL=$(</run/secrets/DATABASE_URL)
  export DATABASE_URL

  # Deploy migration files to change schema without deleting the data
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

# See if we need to do database wipe and reinitialize before starting.
if [[ $DANGER_DATABASE_WIPE_REINITIALIZE == "1" ]]; then
  # Run database wipe and reinitialize
  DANGER_DATABASE_WIPE_REINITIALIZE
  # Clear Redis keys
  clear_redis

# Otherwise, just run our database migration
else
  database_migration
fi

# Run the app normally, switching to the node process as PID 1
exec "$@"

#!/bin/sh
# This script is used to authenticate the webhook requests.
# - The provided token is received as the first parameter. Otherwise, the envVar $HOOK_TOKEN is used.
# - The expected token is received as the second parameter. Otherwise, the envVar $DEFAULT_AUTH_TOKEN is used.
#   If the $DEFAULT_AUTH_TOKEN envVar is not set, the docker secret /run/secrets/DEFAULT_AUTH_TOKEN is used.

provided_token=$1
if [ -z "${provided_token}" ]; then # If no override is provided
  provided_token=$HOOK_TOKEN  # Use the $HOOK_TOKEN envVar as the provided_token
fi

expected_token=$2
if [ -z "${expected_token}" ]; then # If no override is provided
  expected_token=$DEFAULT_AUTH_TOKEN  # Use the $DEFAULT_AUTH_TOKEN envVar as the expected_token

  if [ -z "${expected_token}" ]; then
    expected_token=$(cat /run/secrets/DEFAULT_AUTH_TOKEN) # If the envVar is not set, use the docker secret as the expected_token
  fi
fi


main() {
    if [ -z "${provided_token}" ]; then
      echo "Authentication Error ⚠: This webhook expects a token for authentication."
      exit 1
    fi

    if [ "$provided_token" = "$expected_token" ]; then
      echo "Authentication Successful ✅"
      exit 0
    fi

    echo "Authentication Failed ❌"
    exit 1
}

main


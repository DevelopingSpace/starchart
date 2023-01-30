#!/bin/sh
# This script checks if the $HOOK_token environment variable is equal to the $DEFAULT_AUTH_TOKEN environment variable.

# The 2 tokens being compared can be overridden by passing in the provided key and expected key as arguments.
# Example: ./.authenticate.sh <provided_key> <expected_key>
# If no arguments are passed in, the script will use the $HOOK_token and $DEFAULT_AUTH_TOKEN environment variables.

providedKey=$1
if [ -z "${providedKey}" ]; then
  providedKey=$HOOK_token
fi

expectedKey=$2
if [ -z "${expectedKey}" ]; then
  expectedKey=$DEFAULT_AUTH_TOKEN
fi


main() {
    if [ -z "${providedKey}" ]; then
      echo "AUTHENTICATION FAILED: The webhook token is not set. Provide the webhook token as the key parameter in the webhook URL."
      exit 1
    fi

    if [ "$providedKey" = "$expectedKey" ]; then
      echo "Authentication successful."
      exit 0
    fi

    echo "AUTHENTICATION FAILED: The webhook token is invalid. Provide the correct webhook token as the key parameter in the webhook URL."
    exit 1
}

main

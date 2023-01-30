#!/bin/sh
pwd
main() {
  # This is an example webhook that can be used to check if the Docker daemon is running.
  if docker info; then
    echo "✅ Heartbeat successful."
  else
    echo "❌ Heartbeat failed."
  fi
}

if ./.authenticate.sh $HOOK_token AnOverridenToken; then
  main
fi


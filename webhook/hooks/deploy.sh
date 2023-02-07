#!/bin/sh

TARGET_IMAGE="starchart_web"
TARGET_SERVICE="starchart_web"

main() {
    echo "Deploying..."

    if [ -z "${HOOK_TAG}" ]; then
      echo "The tag is not set. Skipping deployment."
      exit 1
    fi

    echo "Updating service ${TARGET_SERVICE} to image ${TARGET_IMAGE}:${HOOK_TAG}..."

    cmd="docker service update --image ${TARGET_IMAGE}:${HOOK_TAG} ${TARGET_SERVICE}"

    echo "Running command: ${cmd}"

    if $cmd; then # If the command is successful
      echo "Service updated."
    else  # If the command fails
      echo "Service update failed."
      exit 1
    fi

    echo "Deployment successful."
}

if ./.authenticate.sh; then
  main
fi

#!/bin/sh
pwd
main() {
    echo "Deploying..."

    if [ -z "${HOOK_tag}" ]; then
      echo "The tag is not set. Skipping deployment."
      exit 1
    fi

    if [ -z "${HOOK_image}" ]; then
      echo "The image is not set. Skipping deployment."
      exit 1
    fi

    if [ -z "${HOOK_service}" ]; then
      echo "The service is not set. Skipping deployment."
      exit 1
    fi

    echo "Updating service ${HOOK_service}..."

    cmd="docker service update --image ${HOOK_image}:${HOOK_tag} ${HOOK_service}"
    echo "Running command: ${cmd}"

    eval $cmd

    echo "Deployment successful."
}

if ./.authenticate.sh; then
  main
fi

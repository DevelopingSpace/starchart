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

    echo "Updating service ${HOOK_service} to image ${HOOK_image}:${HOOK_tag}..."

    # The printf '%q' escapes special characters like spaces, quotes, slashes, etc. Example: "my 'image' name" -> "my\ \'image\'\ name"
    cmd="docker service update --image $(printf '%q' "${HOOK_image}:${HOOK_tag}") $(printf '%q' "${HOOK_service}")"

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

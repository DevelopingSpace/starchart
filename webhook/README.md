# Starchart Deploy Webhook

Starchart uses a GitHub Actions Workflow to automate deployment to staging and production. This is done using [webhook](https://github.com/adnanh/webhook).

## Setup

The `deploy.sh` file and `hooks.json` should be placed together, and `hooks.json` updated to include the correct paths:

```json
[
  {
    "id": "deploy",
    "execute-command": "/path/deploy.sh",
    "command-working-directory": "/path",
```

An HMAC secret needs to be installed in GitHub Actions Encrypted Secrets, as well as in the `hooks.json` file:

```json
"trigger-rule": {
  "match": {
    "type": "payload-hmac-sha256",
    "secret": "TODO: update me to match secret stored in GitHub Actions...",
    "parameter": {
      "source": "header",
      "name": "X-Hub-Signature"
    }
  }
}
```

When the webhook is called, the secret is used to create a digest using the body, which can only be verified by using the same secret. The secret itself is never transmitted between GitHub and the deployment server.

The `deploy.sh` script assumes that the Docker image for Starchart is at `ghcr.io/developingspace/starchart` and that the running Docker service is named `starchart_mycustomdomain`. If these are not correct, update the variables in `deploy.sh`.

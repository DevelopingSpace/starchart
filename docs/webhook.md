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

The `starchart-webhook.service` file defines a [systemd unit file](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings) to be installed on the server.

Make sure that you update this file with the correct paths/ports for your `hooks.json` file, etc. Once it is configured properly, use the following to install and start it:

```sh
touch /etc/systemd/system/starchart-webhook.service
chmod 664 /etc/systemd/system/starchart-webhook.service
systemctl daemon-reload
systemctl start starchart-webhook.service
```

> NOTE: updating this may require changes to SELinux

The following commands can also be used to interact with the service:

- `systemctl enable` - at next boot
- `systemctl disable` - at next boot
- `systemctl start` - now
- `systemctl stop` - now
- `systemctl enable` - `--now` combines enable and start
- `systemctl disable` - `--now` combines disable and stop
- `systemctl restart` - sequentially combines stop and start
- `systemctl status` - show the status of the service

To see the logs for the service, use:

```sh
sudo journalctl -u starchart-webhook
```

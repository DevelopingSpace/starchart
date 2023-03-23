# Deployment

Startchart depends on a number of external services, including:

1. MySQL
2. Amazon Route53
3. An SMTP Server
4. A Redis Server
5. Let's Encrypt
6. SAML2 IdP (e.g., Azure Active Directory)

## Configuration

A number of environment variables and Docker secrets are required at runtime.

### Environment Variables

The following configuration values must be set via environment variables.

| Variable Name                | Description                                                                                                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_URL`                    | The hostname of the server (e.g., `https://mycustomdomain.senecacollege.ca`). NOTE: when running in development, use `http://host.docker.internal:8080` vs. `http://localhost`, so that Docker DNS resolution works between the login container and host. |
| `PORT`                       | The server runs on port `8080` by default                                                                                                                                                                                                                 |
| `LOG_LEVEL`                  | The log level to use for log messages. One of `error`, `debug`, `info`, etc. See [Winston docs](https://github.com/winstonjs/winston#logging-levels). Defaults to `info`                                                                                  |
| `ROOT_DOMAIN`                | The DNS root domain for the hosted zone (e.g., `starchart.com`)                                                                                                                                                                                           |
| `AWS_ROUTE53_HOSTED_ZONE_ID` | The existing Amazon Route53 Hosted Zone ID to use (e.g., `Z23ABC4XYZL05B`)                                                                                                                                                                                |
| `NOTIFICATIONS_EMAIL_USER`   | The email address from which notifications are sent                                                                                                                                                                                                       |
| `SMTP_PORT`                  | The port to use for the SMTP server. Defaults to `587` in production (using `smtp.office365.com`) and `1025` in development (using ([MailHog](https://github.com/mailhog/MailHog))                                                                        |
| `LETS_ENCRYPT_ACCOUNT_EMAIL` | The email address to use for the app's [single Let's Encrypt account](https://letsencrypt.org/docs/integration-guide/#one-account-or-many)                                                                                                                |
| `REDIS_URL`                  | The Redis server to use for the worker queues. Defaults to `redis://redis:6379` in production and `localhost:6379` in development.                                                                                                                        |
| `SAML_IDP_METADATA_PATH`     | The file path of the SAML Identify Provider (IdP)'s metadata XML. We store various XML files in `config/` and use `config/idp-metadata-dev.xml` by default in development.                                                                                |
| `SECRETS_OVERRIDE`           | In development, to override the Docker secrets                                                                                                                                                                                                            |
| `DATABASE_SETUP`             | In order to sync the Prisma schema with MySQL, set `DATABASE_SETUP=1` when running the app. NOTE: this **wipes all data** in MySQl and Redis, so be careful!                                                                                              |

### Secrets

The following secrets must be added to the Docker engine using [Docker Swarm secrets](https://docs.docker.com/engine/swarm/secrets/).

| Secret Name                            | Description                                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`                    | The AWS Account Access Key ID for use with Route 53                                                                                                                          |
| `AWS_SECRET_ACCESS_KEY`                | The AWS Account Secret Access Key for use with Route 53                                                                                                                      |
| `LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM` | The RSA Private Key for the Let's Encrypt account, in PEM format                                                                                                             |
| `SESSION_SECRET`                       | The long, random string to use for keying sessions                                                                                                                           |
| `NOTIFICATIONS_USERNAME`               | The SMTP username to use for sending notifications                                                                                                                           |
| `NOTIFICATIONS_PASSWORD`               | The SMTP password to use for sending notifications                                                                                                                           |
| `DATABASE_URL`                         | The MySQL database connection string URL. NOTE: this is needed as an environment variable only when doing database setup commands, but read as a secret when running the app |

## Running the App via Docker

The app can be started via Docker. If it is the first time you are starting the app, or if there are database changes that need to be applied first, you can set `DATABASE_SETUP=1` in the environment to run Prisma and sync the schema and database (NOTE: this **wipes all data** from MySQL and Redis so be careful!):

```sh
# Run the app without doing anything to the database
$ docker run ghcr.io/developingspace/starchart

# OR, run the app, but sync the datbase first
$ docker run -e DATABASE_SETUP=1 ghcr.io/developingspace/starchart
```

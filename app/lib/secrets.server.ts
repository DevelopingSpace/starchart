import { resolve } from 'path';
import { getSecrets } from 'docker-secret';

// To override the secrets we use, set SECRETS_OVERRIDE=1 in the env
const { SECRETS_OVERRIDE } = process.env;
const secretsDir = SECRETS_OVERRIDE && resolve(process.cwd(), './dev-secrets');
const secrets = getSecrets(secretsDir);

export default secrets;

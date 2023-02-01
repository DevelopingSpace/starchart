import acme from "acme-client";
import { secrets } from "docker-secret";

const { LETSENCRYPT_ACCOUNT_PRIVATE_KEY_PEM } = secrets ?? {};

class LetsEncrypt {
  #client;

  #directoryUrl;

  #accountKey;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      if (!LETSENCRYPT_ACCOUNT_PRIVATE_KEY_PEM)
        throw new Error(
          "The docker secret LETSENCRYPT_ACCOUNT_PRIVATE_KEY_PEM is missing"
        );

      this.#accountKey = LETSENCRYPT_ACCOUNT_PRIVATE_KEY_PEM;
      this.#directoryUrl = acme.directory.letsencrypt.production;
    } else {
      // For testing and local development, let's use an ad-hoc generated key

      this.#accountKey = acme.crypto.createPrivateKey();
      this.#directoryUrl = acme.directory.letsencrypt.production;
    }

    this.#client = new acme.Client({
      directoryUrl: this.#directoryUrl,
      accountKey: this.#accountKey,
    });
  }

  // TODO add features, to be implemented in later tickets
}

export default LetsEncrypt;

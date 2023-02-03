import acme from 'acme-client';
import type {
  Client as AcmeClient,
  Order as AcmeOrder,
  Authorization as AcmeAuthorization,
} from 'acme-client';
import type {
  Account as AcmeAccount,
  DnsChallenge as AcmeDnsChallenge,
} from 'acme-client/types/rfc8555';
import { secrets } from 'docker-secret';

interface ChallengeBundle {
  domain: string;
  value: String;
}

const { LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM } = secrets ?? {};

/**
 * Usage examples
 *
 * new LetsEncrypt()
 *  .initialize()
 *  .then((le) => le.createOrder("xyz.com"))
 *  .then((le) => console.log(le.challengeBundles));
 *
 * new LetsEncrypt()
 *  .initialize()
 *  .then((le) => le.recallOrder(orderUrl))
 *  .then((le) => console.log(le.challengeBundles));
 */

class LetsEncrypt {
  #client?: AcmeClient;

  #directoryUrl?: string;

  #accountKey?: string;

  #account?: AcmeAccount;

  #order?: AcmeOrder;

  #authorizations?: AcmeAuthorization[];

  #challengeBundles?: ChallengeBundle[];

  /**
   * This will reload the account based on the `accountKey`. If the key has no
   * associated account, it will create a new one and return that
   */
  #registerReloadAccount = async () => {
    // https://datatracker.ietf.org/doc/html/rfc8555#section-7.3.1

    const account = await this.#client!.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${process.env.LETS_ENCRYPT_ACCOUNT_EMAIL}`],
    });

    if (account.status !== 'valid') throw new Error(`Acme account is "${account.status}"`);

    this.#account = account;
  };

  initialize = async () => {
    if (process.env.NODE_ENV === 'production') {
      if (!LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM)
        throw new Error('The docker secret LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM is missing');

      if (!process.env.LETS_ENCRYPT_ACCOUNT_EMAIL)
        throw new Error('The env LETS_ENCRYPT_ACCOUNT_EMAIL is missing');

      this.#accountKey = LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM;
      this.#directoryUrl = acme.directory.letsencrypt.production;
    } else {
      // For testing and local development, let's use an ad-hoc generated key

      this.#accountKey = (await acme.crypto.createPrivateKey()).toString();
      this.#directoryUrl = acme.directory.letsencrypt.production;
    }

    this.#client = new acme.Client({
      directoryUrl: this.#directoryUrl,
      accountKey: this.#accountKey,
    });

    await this.#registerReloadAccount();

    return this;
  };

  /**
   * This fn extracts and requests challenge information from / based on
   * the authorizations array that we got in the order.
   */
  #extractChallenges = async () => {
    this.#authorizations = await this.#client!.getAuthorizations(this.#order!);

    /**
     * Each authorization (a soon to be common name or alt name
     * we requested in createOrder => identifiers) contains one or
     * more challenges. At least one challenge per authorization needs
     * to be passed for the authorization to be granted
     *
     * Later, we can use the granted authorizations in our certificate
     */
    const promises = this.#authorizations.map(async (authorization) => {
      const selectedChallenge = authorization.challenges.find(
        ({ type }) => type === 'dns-01'
      ) as AcmeDnsChallenge;

      if (!selectedChallenge)
        throw new Error(
          'The authorization object does not contain dns-01 type challenge. This should never happen.'
        );

      // Get key for challenge
      const keyAuthorization = await this.#client!.getChallengeKeyAuthorization(selectedChallenge);

      const challengeBundle: ChallengeBundle = {
        domain: `_acme-challenge.${authorization.identifier.value}`,
        value: keyAuthorization,
      };

      return challengeBundle;
    });

    this.#challengeBundles = await Promise.all(promises);
  };

  /**
   * Create an order with let's encrypt using the account that was
   * loaded in the initialize step
   *
   * @param {string} rootDomain The domain the certificate will be
   * issued to (cert covers this root domain and one level of subdomains
   * AKA. wildcard)
   * @returns {Promise<this>} Promise of current object. Useful for chaining
   */
  createOrder = async (rootDomain: string) => {
    if (!this.#client || !this.#account)
      throw new Error('You need to initialize the instance first');

    /* Place new order */
    this.#order = await this.#client.createOrder({
      identifiers: [
        { type: 'dns', value: rootDomain },
        { type: 'dns', value: `*.${rootDomain}` },
      ],
    });

    await this.#extractChallenges();

    return this;
  };

  /**
   * When we create an order, we get back a resource URL. We use that URL
   * to recall the order from let's encrypt
   *
   * @param {string} url resource url of the order
   * @returns {Promise<this>} Promise of current object. Useful for chaining
   */
  recallOrder = async (url: string) => {
    if (!this.#client || !this.#account)
      throw new Error('You need to initialize the instance first');

    /**
     * The lib's interface is a bit unfortunate here, but what it actually
     * uses is the order.url and nothing else
     */
    const dummyOrder = { url } as AcmeOrder;
    this.#order = await this.#client.getOrder(dummyOrder);

    await this.#extractChallenges();

    return this;
  };

  get order() {
    return this.#order;
  }

  get authorizations() {
    return this.#authorizations;
  }

  get challengeBundles() {
    return this.#challengeBundles;
  }

  // TODO add features, to be implemented in later tickets
}

export default LetsEncrypt;

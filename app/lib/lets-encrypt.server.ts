import https from 'https';
import dnsPromises from 'dns/promises';
import acme from 'acme-client';

import secrets from '~/lib/secrets.server';

import type { Resolver as PromisesResolver } from 'dns/promises';
import type {
  Client as AcmeClient,
  Order as AcmeOrder,
  Authorization as AcmeAuthorization,
} from 'acme-client';
import type {
  Account as AcmeAccount,
  DnsChallenge as AcmeDnsChallenge,
} from 'acme-client/types/rfc8555';

const { LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM } = secrets;

/**
 * Get the zone domain (i.e., drop subdomains that are not in the root level of the zone)
 * @param {string} domain
 * @returns {Promise<string>} domain
 */
const getHostedZoneForDomain = async (incomingDomain: string): Promise<string> => {
  let domainName = incomingDomain;
  let found = false;

  // loop until we find a soa, each time drop a subdomain from `domainName`
  while (domainName.includes('.') && !found) {
    try {
      await dnsPromises.resolveSoa(domainName);
      found = true;
    } catch (e) {
      // remove one level, i.e., c.b.a.com => b.a.com
      domainName = domainName.replace(/^.*?\./, '');
    }
  }

  if (!found) {
    // We have reached the TLD, resolution failed
    throw new Error(
      `No authoritative DNS server found for ${incomingDomain} or any of its parents`
    );
  }

  // At this point we have the hosted zone in domainName
  return domainName;
};

/**
 * Get an authoritative DNS resolver for the given domain
 * @param {string} domain
 * @returns {Promise<Resolver>} domain
 */
const getAuthoritativeResolverForDomain = async (domain: string): Promise<PromisesResolver> => {
  const hostedZone = await getHostedZoneForDomain(domain);

  const nsRecords = await dnsPromises.resolveNs(hostedZone);
  // Get all ipv4 addresses for all ns records (there may be multiple ipv4 for each NS)
  const nsAddrIpv4Arr = (await Promise.all(nsRecords.map((nsName) => dnsPromises.resolve4(nsName))))
    // Flatten array of arrays
    .flat();

  if (!nsAddrIpv4Arr.length) {
    throw new Error(
      `Could not retrieve any valid ipv4 addresses when looking up NS records for: ${hostedZone}`
    );
  }

  const resolver = new dnsPromises.Resolver();
  resolver.setServers(nsAddrIpv4Arr);

  return resolver;
};
export interface ChallengeBundle extends AcmeDnsChallenge {
  domain: string;
  value: string;
}

/**
 * This code is based on the official example
 * https://github.com/publishlab/node-acme-client/blob/master/examples/api.js
 *
 * Usage examples
 *
 * new LetsEncrypt()
 *  .initialize()
 *  .then((le) => le.createOrder("xyz.com"))
 *  .then((le) => logger.info(le.challengeBundles));
 *
 * new LetsEncrypt()
 *  .initialize()
 *  .then((le) => le.recallOrder(orderUrl))
 *  .then((le) => logger.info(le.challengeBundles));
 *
 * const isChallengeSucceeded = await LetsEncrypt
 *   .verifyChallenge({
 *     domain: '_acme-challenge.foo.com',
 *     key: '12345'
 *   })
 */

/**
 * Order
 * {
 *   "status":"pending",
 *   "expires":"2023-02-16T03:16:59Z",
 *   "identifiers":[
 *     {"type":"dns","value":"*.xyz.com"},
 *     {"type":"dns","value":"xyz.com"}
 *   ],
 *   "authorizations":[
 *     "https://acme-v02.api.letsencrypt.org/acme/authz-v3/201997658246",
 *     "https://acme-v02.api.letsencrypt.org/acme/authz-v3/201997658256"
 *   ],
 *   "finalize":"https://acme-v02.api.letsencrypt.org/acme/finalize/956191086/163728358736",
 *   "url":"https://acme-v02.api.letsencrypt.org/acme/order/956191086/163728358736"
 * }
 */

class LetsEncrypt {
  #client?: AcmeClient;

  #account?: AcmeAccount;

  #order?: AcmeOrder;

  #authorizations?: AcmeAuthorization[];

  #challengeBundles?: ChallengeBundle[];

  /**
   * Verify if key authorization is found on a domain
   * @param {string} domain to check the txt record on
   * @param {string} key to check if found
   */
  static verifyChallenge = async ({
    domain,
    key,
  }: {
    domain: string;
    key: string;
  }): Promise<boolean> => {
    const resolver = await getAuthoritativeResolverForDomain(domain);

    let txtRecords;

    try {
      txtRecords = (await resolver.resolveTxt(domain))
        // Flatten array of arrays
        .flat();

      return txtRecords.includes(key);
    } catch (e) {
      /**
       * Noop, this is expected
       * example: {
       *   errno: undefined,
       *   code: 'ENODATA',
       *   syscall: 'queryTxt',
       *   hostname: '_acme-challenge.testing.user1.starchart.com'
       * }
       */

      return false;
    }
  };

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

    if (account.status !== 'valid') {
      throw new Error(`Acme account is "${account.status}"`);
    }

    this.#account = account;
  };

  initialize = async () => {
    if (!process.env.LETS_ENCRYPT_ACCOUNT_EMAIL) {
      throw new Error('The env LETS_ENCRYPT_ACCOUNT_EMAIL is missing');
    }

    if (!process.env.LETS_ENCRYPT_DIRECTORY_URL) {
      throw new Error('The env LETS_ENCRYPT_DIRECTORY_URL is missing');
    }

    if (!LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM) {
      throw new Error('The docker secret LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM is missing');
    }

    if (process.env.NODE_ENV !== 'production') {
      /**
       * !! Disable SSL certificate validation when we are communicating with
       * the ACME server. This is needed because the dockerized acme server
       * we run for development (pebble) will have a self-signed cert for
       * client-server communication
       *
       * This is an officially supported method of altering axios configuration
       * Has to be run before acme.Client is instantiated
       * https://github.com/publishlab/node-acme-client/pull/13
       */
      acme.axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    this.#client = new acme.Client({
      // Set the ACME server we are going to communicate with
      directoryUrl: process.env.LETS_ENCRYPT_DIRECTORY_URL,
      // Set the PEM, this authenticates us as an account towards the ACME server
      accountKey: LETS_ENCRYPT_ACCOUNT_PRIVATE_KEY_PEM,
    });

    await this.#registerReloadAccount();

    return this;
  };

  /**
   * Expand authorizations based on the order object
   */
  #loadAuthorizations = async () => {
    this.#authorizations = await this.#client!.getAuthorizations(this.#order!);
  };

  /**
   * This fn extracts and requests challenge information from / based on
   * the authorizations array that we got in the order.
   */
  #extractChallenges = async () => {
    /**
     * Each authorization (a soon to be common name or alt name
     * we requested in createOrder => identifiers) contains one or
     * more challenges. At least one challenge per authorization needs
     * to be passed for the authorization to be granted
     *
     * Later, we can use the granted authorizations in our certificate
     */
    const promises = this.#authorizations!.map(async (authorization) => {
      const selectedChallenge = authorization.challenges.find(
        ({ type }) => type === 'dns-01'
      ) as AcmeDnsChallenge;

      if (!selectedChallenge) {
        throw new Error(
          'The authorization object does not contain dns-01 type challenge. This should never happen.'
        );
      }

      // Get key for challenge
      const keyAuthorization = await this.#client!.getChallengeKeyAuthorization(selectedChallenge);

      const challengeBundle: ChallengeBundle = {
        ...selectedChallenge,
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
    if (!this.#client || !this.#account) {
      throw new Error('You need to initialize the instance first');
    }

    /* Place new order */
    this.#order = await this.#client.createOrder({
      identifiers: [
        { type: 'dns', value: rootDomain },
        { type: 'dns', value: `*.${rootDomain}` },
      ],
    });

    // Expand authorizations based on the order
    await this.#loadAuthorizations();

    // Expand and extract challenges based on the authorizations
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
    if (!this.#client || !this.#account) {
      throw new Error('You need to initialize the instance first');
    }

    /**
     * The lib's interface is a bit unfortunate here, but what it actually
     * uses is the order.url and nothing else
     */
    const dummyOrder = { url } as AcmeOrder;
    this.#order = await this.#client.getOrder(dummyOrder);

    /**
     * Expand authorizations based on the order.
     */
    await this.#loadAuthorizations();

    /**
     * Expand and extract challenges based on the authorizations
     * Need this, because challenges need to be loaded in order for them to complete
     */
    await this.#extractChallenges();

    return this;
  };

  /**
   * This function is to be run after DNS propagation of the challenge TXT records are done
   * @returns {Promise<boolean>} signifies if we reached a state when all challenges are completed
   */
  verifyChallenges = async (): Promise<boolean> => {
    if (!this.#client || !this.#order || !this.#challengeBundles) {
      throw new Error('You need to use recallOrder first before you can verify the challenges');
    }

    if (this.#order.status === 'ready') {
      // All challenges have already passed, the order is ready to be finalized
      return true;
    }

    if (['expired', 'revoked', 'deactivated', 'valid'].includes(this.#order.status)) {
      // Do not try if the order already reached a final status
      // https://www.rfc-editor.org/rfc/rfc8555.html#section-7.1.6
      throw new Error(`Order found to be in the following final state: ${this.#order.status}`);
    }

    /**
     * Validate challenges that are in the `pending` or `invalid` state
     * It is possible to retry failed challenges
     * https://www.rfc-editor.org/rfc/rfc8555.html#section-8.2
     */
    await Promise.all(
      this.#challengeBundles
        // Only do pending and invalid
        .filter(({ status }) => ['pending', 'invalid'].includes(status))
        // return the network promise, to be awaited with Promise.all
        .map((challengeBundle) => this.#client!.completeChallenge(challengeBundle))
    );

    /**
     * We just (probably) started some additional async verification processes
     * with the ACME provider. Challenges first go into the `processing` state.
     * We don't return true until all challenges have passed and the order became `ready`
     */
    return false;
  };

  completeOrder = async () => {
    if (!this.#client || !this.#order) {
      throw new Error('You need to use recallOrder first before you can complete it');
    }

    if (this.#order.status !== 'ready') {
      // Only orders in 'ready' state can be completed
      throw new Error(`Order state is ${this.#order.status}`);
    }

    const { identifiers } = this.#order;

    if (!identifiers.length) {
      throw new Error('The order does not contain any identifiers. This should not be possible');
    }

    /**
     * The common name should be the wildcard domain
     * If no wildcard domain is found, use the first one in the identifiers list
     */
    const commonName = (identifiers.find(({ value }) => value.startsWith('*.')) ?? identifiers[0])
      .value;

    // All identifiers that are not the commonName are altNames
    const altNames = identifiers
      // Only keep the value (domain)
      .map(({ value }) => value)
      // Filter out the commonName
      .filter((value) => value !== commonName);

    /* Finalize order */
    const [key, csr] = await acme.crypto.createCsr({
      commonName,
      // Only send the altNames if the array is not empty (spreading 0 into an object does nothing)
      ...(altNames.length && { altNames }),
    });

    this.#order = await this.#client.finalizeOrder(this.#order, csr);

    // fullChain is the publicCertificate + the intermediate certificate(s) for Let's Encrypt
    const fullChain = await this.#client.getCertificate(this.#order);

    // certificate is the public certificate, chain is the intermediate certificate(s) for Let's Encrypt
    const [certificate, ...chain] = acme.crypto.splitPemChain(fullChain);

    return {
      privateKey: key.toString(),
      certificate,
      chain,
      fullChain,
      validFrom: new Date(),
      validTo: new Date(this.#order.expires!),
    };
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
}

export default LetsEncrypt;

import {
  Route53Client,
  CreateHostedZoneCommand,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  GetChangeCommand,
} from '@aws-sdk/client-route-53';
import isFQDN from 'validator/lib/isFQDN';
import isIP from 'validator/lib/isIP';

import logger from '~/lib/logger.server';
import secrets from '~/lib/secrets.server';
import { buildUserBaseDomain } from '~/utils';

import type {
  CreateHostedZoneResponse,
  ChangeResourceRecordSetsResponse,
  GetChangeResponse,
  ListResourceRecordSetsResponse,
} from '@aws-sdk/client-route-53';
import type { DnsRecordType } from '@prisma/client';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = secrets;
const { NODE_ENV } = process.env;

/**
 * In production, we require the root domain, hosted zone id, and AWS
 * credentials to be configured.
 */
if (NODE_ENV === 'production') {
  if (!process.env.AWS_ROUTE53_HOSTED_ZONE_ID) {
    throw new Error('AWS_ROUTE53_HOSTED_ZONE_ID environment variable is missing');
  }

  if (!process.env.ROOT_DOMAIN) {
    throw new Error('ROOT_DOMAIN environment variable is missing');
  }

  if (!AWS_ACCESS_KEY_ID) {
    throw new Error('Missing AWS_ACCESS_KEY_ID secret');
  }

  if (!AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS_SECRET_ACCESS_KEY secret');
  }
} else {
  // In dev, we only need a root domain, and can fake the rest
  process.env.ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'starchart.com';
}

// Ensure a trailing `.` on a domain to make it fully qualified:
// a.b.c -> a.b.c. | a.b.c. -> a.b.c.
const toFQDN = (domain: string) => domain.replace(/\.?$/, '.');

/**
 * In production, we have to have a zone id to do anything, but in
 * dev, we create it on startup if not set.
 * @returns string - the AWS Hosted Zone ID to use
 */
async function hostedZoneId() {
  if (!process.env.AWS_ROUTE53_HOSTED_ZONE_ID) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AWS_ROUTE53_HOSTED_ZONE_ID environment variable is missing');
    }

    // In development/testing, create a hosted zone if the variables are missing
    process.env.AWS_ROUTE53_HOSTED_ZONE_ID = await createHostedZone(process.env.ROOT_DOMAIN!);
    logger.debug(
      `DNS: created hosted zone ${process.env.AWS_ROUTE53_HOSTED_ZONE_ID} for ${process.env.ROOT_DOMAIN}`
    );
  }

  return process.env.AWS_ROUTE53_HOSTED_ZONE_ID;
}

const credentials = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
  }

  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  };
};

/**
 * Allow overriding the AWS URL endpoint for Route53 in dev for moto server
 * @returns string | undefined - if we override, we provide a new URL
 */
const awsEndpoint = () => {
  return process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5053';
};

export const route53Client = new Route53Client({
  endpoint: awsEndpoint(),
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: credentials(),
});

export async function createHostedZone(domain: string) {
  try {
    const command = new CreateHostedZoneCommand({
      Name: domain,
      CallerReference: new Date().toString(),
    });
    const response: CreateHostedZoneResponse = await route53Client.send(command);

    if (!response.HostedZone?.Id) {
      throw new Error('Missing hosted zone ID in AWS response');
    }
    return response.HostedZone.Id.replace('/hostedzone/', '');
  } catch (error) {
    logger.warn('DNS Error in createHostedZone', { domain, error });
    throw new Error(`Error while creating hosted zone`);
  }
}

export const createDnsRecord = (
  username: string,
  type: DnsRecordType,
  fqdn: string,
  value: string
) => {
  try {
    return upsertDnsRecord(username, type, fqdn, value);
  } catch (error) {
    logger.warn('DNS Error in createDnsRecord', { username, type, fqdn, value, error });
    throw new Error(`Error occurred while creating resource record`);
  }
};

async function checkDnsRecordExists(type: DnsRecordType, fqdn: string, value: string) {
  try {
    const command = new ListResourceRecordSetsCommand({
      HostedZoneId: await hostedZoneId(),
      StartRecordName: fqdn,
      StartRecordType: type,
      MaxItems: 1,
    });
    const { ResourceRecordSets }: ListResourceRecordSetsResponse = await route53Client.send(
      command
    );

    // If we don't get back a single Resource Record Set, it's not a match
    if (ResourceRecordSets?.length !== 1) {
      return false;
    }
    // Grab the one and only one and compare values
    const { Name, Type, ResourceRecords } = ResourceRecordSets[0];
    return (
      Name === toFQDN(fqdn) &&
      Type === type &&
      ResourceRecords?.length === 1 &&
      ResourceRecords[0].Value === value
    );
  } catch (error) {
    logger.warn('DNS Error in checkDnsRecordExists', { type, fqdn, value, error });
    throw new Error(`Error while checking if DNS record exists`);
  }
}

export const upsertDnsRecord = async (
  username: string,
  type: DnsRecordType,
  fqdn: string,
  value: string
) => {
  try {
    if (!isNameValid(fqdn, username)) {
      logger.error('DNS Error in upsertDnsRecord - invalid record name provided', {
        fqdn,
        username,
        baseDomain: buildUserBaseDomain(username),
      });

      throw new Error('DNS Error in upsertDnsRecord - invalid record name provided');
    }

    if (!isValueValid(type, value)) {
      logger.error('DNS Error in upsertDnsRecord - invalid record value provided', {
        fqdn,
        username,
        type,
        value,
      });
      throw new Error('DNS Error in upsertDnsRecord - invalid record value provided');
    }

    const command = new ChangeResourceRecordSetsCommand({
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: fqdn,
              Type: type,
              ResourceRecords: [
                {
                  Value: value,
                },
              ],
              TTL: 60 * 5,
            },
          },
        ],
      },
      HostedZoneId: await hostedZoneId(),
    });
    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error(`DNS Error - missing ID in AWS ChangeInfo response`);
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    logger.warn('DNS Error in upsertDnsRecord', { username, type, fqdn, value, error });
    throw new Error(`DNS Error occurred while updating resource record: ${error}`);
  }
};

export const deleteDnsRecord = async (
  username: string,
  type: DnsRecordType,
  fqdn: string,
  value: string
) => {
  try {
    if (!isNameValid(fqdn, username)) {
      logger.error('DNS Error in deleteDnsRecord - invalid record name provided', {
        fqdn,
        username,
        baseDomain: buildUserBaseDomain(username),
      });
      throw new Error('DNS Error in deleteDnsRecord - invalid name provided');
    }

    if (!isValueValid(type, value)) {
      logger.error('DNS Error in deleteDnsRecord - invalid record value provided', {
        fqdn,
        username,
        type,
        value,
      });
      throw new Error('DNS Error in deleteDnsRecord - invalid value provided');
    }

    // If no such record exists in Route53, we're done ("delete" state already achieved)
    if (!(await checkDnsRecordExists(type, fqdn, value))) {
      logger.debug('DNS deleteDnsRecord - no such record in Route53, skipping', {
        type,
        fqdn,
        value,
      });
      return null;
    }

    const command = new ChangeResourceRecordSetsCommand({
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: fqdn,
              Type: type,
              ResourceRecords: [
                {
                  Value: value,
                },
              ],
              TTL: 60 * 5,
            },
          },
        ],
      },
      HostedZoneId: await hostedZoneId(),
    });

    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error('DNS Error - missing ID in AWS ChangeInfo response');
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    logger.warn('DNS Error in deleteDnsRecord', { username, type, fqdn, value, error });
    throw new Error(`DNS Error occurred while deleting resource record`);
  }
};

export const getChangeStatus = async (changeId: string) => {
  try {
    const command = new GetChangeCommand({
      Id: changeId,
    });
    const response: GetChangeResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Status) {
      throw new Error('DNS Error - could not get ChangeIno for requested ID from AWS response');
    }
    return response.ChangeInfo.Status;
  } catch (error) {
    logger.warn('DNS Error in getChangeStatus', { changeId, error });
    throw new Error(`Error occurred while getting change status`);
  }
};

/* Domain name rules
1. Full domain name pattern should be [subdomain].[username].rootDomain.com
2. Subdomain can contain only alphanumerical characters, '-', and '_'
3. Subdomain should not start or end with -
4. Subdomain cannot contain multiple consecutive '-' or '_'
5. Subdomain can contain uppercase in UI but it is converted to lowercase before validation */
export const isNameValid = (fqdn: string, username: string) => {
  const baseDomain = buildUserBaseDomain(username);

  /* Full domain name must end with username and root domain.
  Here it removes username and root domain,
  to validate only subdomain that user has input */
  const toRemove = `.${baseDomain}`;
  if (!fqdn.endsWith(toRemove)) {
    return false;
  }
  const subdomain = fqdn.substring(0, fqdn.length - toRemove.length);

  //It only validates subdomain name, not username and root domain
  return (
    /^(?!.*[-_]{2,})(?!^[-])[a-z0-9_-]+[a-z0-9]$/.test(subdomain) &&
    isFQDN(fqdn, {
      allow_underscores: true,
    })
  );
};

export const isValueValid = (type: DnsRecordType, value: string) => {
  if (type === 'A') {
    return isIP(value, 4);
  }

  if (type === 'AAAA') {
    return isIP(value, 6);
  }

  // CNAME can be any non-empty string. Let AWS validate it.
  return value.length >= 1;
};

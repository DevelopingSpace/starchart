import {
  Route53Client,
  CreateHostedZoneCommand,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} from '@aws-sdk/client-route-53';
import isFQDN from 'validator/lib/isFQDN';
import isIP from 'validator/lib/isIP';

import logger from '~/lib/logger.server';
import secrets from '~/lib/secrets.server';

import type {
  CreateHostedZoneResponse,
  ChangeResourceRecordSetsResponse,
  GetChangeResponse,
} from '@aws-sdk/client-route-53';
import type { RecordType } from '@prisma/client';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = secrets;

/**
 * In production, we require the root domain, hosted zone id, and AWS
 * credentials to be configured. In development/testing, we will do
 * it automatically if these are not set in the environment.
 */
export async function init() {
  if (process.env.NODE_ENV === 'production') {
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
    process.env.ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'starchart.com';
    if (!process.env.AWS_ROUTE53_HOSTED_ZONE_ID) {
      try {
        process.env.AWS_ROUTE53_HOSTED_ZONE_ID = await createHostedZone(process.env.ROOT_DOMAIN);
        logger.debug(
          `DNS: created hosted zone ${process.env.AWS_ROUTE53_HOSTED_ZONE_ID} for ${process.env.ROOT_DOMAIN}`
        );
      } catch (err) {
        logger.error('DNS init error', err);
        throw err;
      }
    }
  }
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

export const route53Client = new Route53Client({
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:5053',
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
    logger.warn(error);
    throw new Error(`Error while creating hosted zone`);
  }
}

export const createRecord = (username: string, type: RecordType, name: string, value: string) => {
  try {
    return upsertRecord(username, type, name, value);
  } catch (error) {
    logger.warn(error);
    throw new Error(`Error occurred while creating resource record`);
  }
};

export const upsertRecord = async (
  username: string,
  type: RecordType,
  name: string,
  value: string
) => {
  try {
    if (!isNameValid(name, username)) {
      logger.error('Invalid record name provided', {
        name,
        username,
        baseDomian: `${username}.${process.env.ROOT_DOMAIN}`,
      });

      throw new Error('Invalid record name provided');
    }

    if (!isValueValid(type, value)) {
      logger.error('Invalid record value provided', {
        name,
        username,
        type,
        value,
      });
      throw new Error('Invalid record value provided');
    }

    const command = new ChangeResourceRecordSetsCommand({
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: name,
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
      HostedZoneId: process.env.AWS_ROUTE53_HOSTED_ZONE_ID,
    });
    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error(`Missing ID in ChangeInfo`);
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    logger.warn(error);
    throw new Error(`Error occurred while updating resource record: ${error}`);
  }
};

export const deleteRecord = async (
  username: string,
  type: RecordType,
  name: string,
  value: string
) => {
  try {
    if (!isNameValid(name, username)) {
      throw new Error('Invalid name provided');
    }

    if (!isValueValid(type, value)) {
      throw new Error('Invalid value provided');
    }

    const command = new ChangeResourceRecordSetsCommand({
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: name,
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
      HostedZoneId: process.env.AWS_ROUTE53_HOSTED_ZONE_ID,
    });

    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error('Missing ID in ChangeInfo');
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    logger.warn(error);
    throw new Error(`Error occurred while deleting resource record`);
  }
};

export const getChangeStatus = async (changeId: string) => {
  try {
    const command = new GetChangeCommand({
      Id: changeId,
    });
    const response: GetChangeResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Status) {
      throw new Error('Could not get ChangeIno for requested ID');
    }
    return response.ChangeInfo.Status;
  } catch (error) {
    logger.warn(error);
    throw new Error(`Error occurred while getting change status`);
  }
};

/* Domain name rules
1. Domain name pattern should be [name].[username].rootDomain.com
2. Domain name can contain only alphanumerical characters, '-', and '_'
3. Domain name should not start or end with -
4. Domain name cannot contain multiple consecutive '-' or '_'
5. Domain name can contain uppercase in UI but it is converted to lowercase before validation */
export const isNameValid = (name: string, username: string) => {
  const rootDomain = process.env.ROOT_DOMAIN!;

  /* Domain name must end with username and root domain.
  Here it removes username and root domain,
  to validate only subdomain that user has input */
  const toRemove = `.${username}.${rootDomain}`;
  if (!name.endsWith(toRemove)) {
    return false;
  }
  const subdomain = name.substring(0, name.length - toRemove.length);

  //It only validates subdomain name, not username and root domain
  return (
    /^(?!.*[-_]{2,})(?!^[-])[a-z0-9_-]+[a-z0-9]$/.test(subdomain) &&
    isFQDN(name, {
      allow_underscores: true,
    })
  );
};

export const isValueValid = (type: RecordType, value: string) => {
  if (type === 'A') {
    return isIP(value, 4);
  }

  if (type === 'AAAA') {
    return isIP(value, 6);
  }

  // CNAME can be any non-empty string. Let AWS validate it.
  return value.length >= 1;
};

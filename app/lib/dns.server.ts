import {
  Route53Client,
  CreateHostedZoneCommand,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} from '@aws-sdk/client-route-53';
import type {
  CreateHostedZoneResponse,
  ChangeResourceRecordSetsResponse,
  GetChangeResponse,
} from '@aws-sdk/client-route-53';
import { isIPv4, isIPv6 } from 'is-ip';

export const route53Client = new Route53Client({
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:5053',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

export enum RecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  TXT = 'TXT',
}

export const createHostedZone = async (domain: string) => {
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
    // TODO: fix with better logging...
    console.warn(error);
    throw new Error(`Error while creating hosted zone`);
  }
};

export const createRecord = (
  hostedZoneId: string,
  type: RecordType,
  name: string,
  value: string
) => {
  try {
    return upsertRecord(hostedZoneId, type, name, value);
  } catch (error) {
    // TODO: fix with better logging...
    console.warn(error);
    throw new Error(`Error occurred while creating resource record`);
  }
};

export const upsertRecord = async (
  hostedZoneId: string,
  type: RecordType,
  name: string,
  value: string
) => {
  try {
    if (!isNameValid(name)) {
      throw new Error('Invalid name provided');
    }

    if (!isValueValid(type, value)) {
      throw new Error('Invalid value provided');
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
            },
          },
        ],
      },
      HostedZoneId: hostedZoneId,
    });
    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error(`Missing ID in ChangeInfo`);
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    // TODO: fix with better logging...
    console.warn(error);
    throw new Error(`Error occurred while updating resource record: ${error}`);
  }
};

export const deleteRecord = async (
  hostedZoneId: string,
  type: RecordType,
  name: string,
  value: string
) => {
  try {
    if (!isNameValid(name)) {
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
            },
          },
        ],
      },
      HostedZoneId: hostedZoneId,
    });

    const response: ChangeResourceRecordSetsResponse = await route53Client.send(command);

    if (!response.ChangeInfo?.Id) {
      throw new Error('Missing ID in ChangeInfo');
    }
    return response.ChangeInfo.Id;
  } catch (error) {
    // TODO: fix with better logging...
    console.warn(error);
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
    // TODO: fix with better logging...
    console.warn(error);
    throw new Error(`Error occurred while getting change status`);
  }
};

const isNameValid = (name: string) => {
  return /^[a-z0-9-]+.[a-z]+.[a-z]+\.?$/.test(name);
};

const isValueValid = (type: RecordType, value: string) => {
  if (type === 'A') {
    return isIPv4(value);
  }

  if (type === 'AAAA') {
    return isIPv6(value);
  }

  // CNAME can be any non-empty string. Let AWS validate it.
  return value.length >= 1;
};

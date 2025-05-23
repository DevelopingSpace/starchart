import { isEqual } from 'lodash';
import logger from '~/lib/logger.server';

import { DnsRecordType } from '@prisma/client';

import { Change, ChangeAction } from '@aws-sdk/client-route-53';
import type { ReconcilerCompareStructure } from './ReconcilerTypes';
import { toRoute53RecordValue } from './route53Utils.server';

interface CompareStructures {
  dbStructure: ReconcilerCompareStructure;
  route53Structure: ReconcilerCompareStructure;
}

export const createRemovedChangeSetFromCompareStructures = ({
  dbStructure,
  route53Structure,
}: CompareStructures) => {
  const toChange: Change[] = [];

  /**
   * If something is present in route53 but is completely missing in db,
   * then we have to delete it
   */
  Object.keys(route53Structure).forEach((fqdn) => {
    Object.keys(route53Structure[fqdn]).forEach((type) => {
      const route53Value = route53Structure[fqdn][type as DnsRecordType]!;
      const dbValue = dbStructure[fqdn]?.[type as DnsRecordType];

      if (dbValue) {
        // Both of them have this
        return;
      }

      toChange.push({
        Action: ChangeAction.DELETE,
        ResourceRecordSet: {
          Name: fqdn,
          Type: type as DnsRecordType,
          ResourceRecords: route53Value.map((value) => ({
            // Convert to special Route53 TXT record format. Details in route53Utils.server.ts
            Value: toRoute53RecordValue(type as DnsRecordType, value),
          })),
          TTL: 60 * 5,
        },
      });
    });
  });

  return toChange;
};

export const createUpsertedChangeSetFromCompareStructures = ({
  dbStructure,
  route53Structure,
}: CompareStructures) => {
  const toChange: Change[] = [];

  /**
   * Now loop through all the data from the DB. If the data in
   * Route53 is not the same, we should upsert
   */
  Object.keys(dbStructure).forEach((fqdn) => {
    Object.keys(dbStructure[fqdn]).forEach((type) => {
      const dbValue = dbStructure[fqdn][type as DnsRecordType]!;
      const route53Value = route53Structure[fqdn]?.[type as DnsRecordType];
      // When comparing, we do not care about the order
      if (isEqual(dbValue?.sort(), route53Value?.sort())) {
        // Both of them are equal
        return;
      }

      /**
       * https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-multivalue.html#rrsets-values-multivalue-type
       *
       * According to the above, NS and CNAME records can't be multi-value
       */

      if (dbValue.length > 1 && (type == 'NS' || type == 'CNAME')) {
        logger.error(
          'Error creating DNS changeset NS and CNAME records cannot be multi-value. Ignoring records',
          { fqdn, type }
        );
        return;
      }

      toChange.push({
        Action: ChangeAction.UPSERT,
        ResourceRecordSet: {
          Name: fqdn,
          Type: type as DnsRecordType,
          ResourceRecords: dbValue.map((value) => ({
            // Convert to special Route53 TXT record format. Details in route53Utils.server.ts
            Value: toRoute53RecordValue(type as DnsRecordType, value),
          })),
          TTL: 60 * 5,
        },
      });
    });
  });

  return toChange;
};

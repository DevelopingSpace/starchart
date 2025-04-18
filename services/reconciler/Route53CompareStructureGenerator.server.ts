import { set } from 'lodash';

import { getDnsRecordSetPage } from './route53-client.server';
import { fromRoute53RecordValue, isSupportedDnsRecordType } from './route53Utils.server';

// Using this in JS code later, cannot `import type`
import { DnsRecordType } from '@prisma/client';
import type {
  ResourceRecordSet,
  ListResourceRecordSetsResponse,
  RRType,
} from '@aws-sdk/client-route-53';
import type { ReconcilerCompareStructure } from './ReconcilerTypes';

// Validate `[subdomain].[username].starchart.com.`
// escape `.` characters in ROOT_DOMAIN also
const formatVerificationRegexp = new RegExp(
  `[a-z0-9_-]+\\.[a-z0-9-]+\\.${(process.env.ROOT_DOMAIN as string).replace(/\./g, '\\.')}\\.$`
);

class Route53CompareStructureGenerator {
  #MUTATEDcompareStructure: ReconcilerCompareStructure = {};

  #processRecordSetPage = (recordSetPage: ResourceRecordSet[]) => {
    recordSetPage.forEach((recordSet) => {
      // Unsure as to how those could be undefined, but according to AWS sdk, they could
      // Also, ignore records that are not in the format we manage
      if (!recordSet.Type || !recordSet.Name || !formatVerificationRegexp.test(recordSet.Name)) {
        return;
      }

      // We only care about record types that we handle. NS, SOA, etc. should be ignored
      // RecordSet.Type is given as `string`, so we have to do this for TS to compare them
      if (isSupportedDnsRecordType(recordSet.Type)) {
        return;
      }

      const value = recordSet.ResourceRecords?.map(({ Value }) => Value)
        .filter((value) => !!value)
        .map((value) =>
          // Convert from special Route53 TXT record format. Details in route53Utils.server.ts
          fromRoute53RecordValue(recordSet.Type as DnsRecordType, value!)
        ) as string[];

      // and set that value on our compare structure
      set(this.#MUTATEDcompareStructure, [recordSet.Name, recordSet.Type], value);
    });
  };

  /**
   * This Fn reads the complete Route53 zone into a `ReconcilerCompareStructure` type object
   * to be used for later comparison with our database data
   */
  generate = async (): Promise<ReconcilerCompareStructure> => {
    let morePages: boolean = true;
    let nextFqdn: string | undefined = undefined;
    let nextType: RRType | undefined = undefined;

    while (morePages) {
      const response: ListResourceRecordSetsResponse = await getDnsRecordSetPage(
        nextFqdn,
        nextType
      );
      morePages = !!response.IsTruncated;
      nextFqdn = response.NextRecordName;
      nextType = response.NextRecordType;

      if (!response.ResourceRecordSets) {
        continue;
      }

      // !!! `MUTATEDcompareStructure` is passed by reference and is mutated by fn !!!
      this.#processRecordSetPage(response.ResourceRecordSets);
    }

    return this.#MUTATEDcompareStructure;
  };
}

export default Route53CompareStructureGenerator;

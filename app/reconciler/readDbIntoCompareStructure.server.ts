import { get, set } from 'lodash';
import { getReconciliationData } from '~/models/dns-record.server';
import { buildDomain } from '../utils';

import type { ReconcilerCompareStructure } from './ReconcilerTypes';

/**
 * This Fn reads the database `Record` table into a `ReconcilerCompareStructure` type object
 * to be used for later comparison with Route53
 */
const readDbIntoCompareStructure = async (): Promise<ReconcilerCompareStructure> => {
  const MUTATEDcompareStructure: ReconcilerCompareStructure = {};

  const dnsData = await getReconciliationData();

  // Populate compareStructure with data from the `Record` table
  dnsData.forEach(({ username, subdomain, type, value }) => {
    const fqdn = `${buildDomain(username, subdomain)}.`;

    // Get the previous value for fqdn.recordType (or an empty array if missing)
    // and combine it with the new value we are just processing
    const combinedValue = [...get(MUTATEDcompareStructure, [fqdn, type], []), value];

    // and set that value on our compare structure
    set(MUTATEDcompareStructure, [fqdn, type], combinedValue);
  });

  return MUTATEDcompareStructure;
};

export default readDbIntoCompareStructure;

import type { DnsRecordType } from '@prisma/client';

export interface ReconcilerCompareStructure {
  [fqdn: string]: {
    // Next layer is the record type
    [recordType in DnsRecordType]?: string[];
  };
}

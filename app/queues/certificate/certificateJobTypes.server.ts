import type { DnsRecord } from '@prisma/client';

export interface CertificateJobData {
  rootDomain: string;
  username: DnsRecord['username'];
  certificateId: DnsRecord['id'];
}

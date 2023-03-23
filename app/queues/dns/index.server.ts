import { DnsRecordStatus } from '@prisma/client';

import { buildDomain } from '~/utils';
import { createUserDnsRecord, updateDnsRecordById } from '~/models/dns-record.server';
import { dnsQueue } from './dns-queue.server';

import type { DnsRecord } from '@prisma/client';
import type { DnsJobData } from './dns-worker.server';

type Subdomain = { subdomain: string };

function addJob(jobName: string, jobData: DnsJobData) {
  return dnsQueue.add(jobName, jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10_000,
    },
  });
}

// Enqueue a new DNS Create job
export async function addCreateDnsRequest(
  data: Pick<DnsRecord, 'username' | 'type' | 'value'> &
    Partial<Pick<DnsRecord, 'description' | 'course' | 'ports'>> &
    Subdomain
) {
  const { username, type, subdomain, value } = data;

  // Before running workflow, add a new record to the DB
  const dnsRecordId = await createUserDnsRecord({
    username,
    type,
    subdomain,
    value,
  });

  const fqdn = buildDomain(username, subdomain);
  const jobName = `create-dns-record:${fqdn}`;
  return addJob(jobName, {
    dnsOperation: 'create',
    dnsRecordId,
    username,
    type,
    fqdn,
    value,
  });
}

// Enqueue a new DNS Update job
export async function addUpdateDnsRequest(
  data: Pick<DnsRecord, 'id' | 'username' | 'type' | 'value'> &
    Partial<Pick<DnsRecord, 'description' | 'course' | 'ports'>> &
    Subdomain
) {
  const { id, username, type, subdomain, value } = data;

  // Before running workflow, update the dns record in DB
  await updateDnsRecordById(id, { ...data, status: DnsRecordStatus.pending });

  const fqdn = buildDomain(username, subdomain);
  const jobName = `update-dns-record:${fqdn}`;
  return addJob(jobName, {
    dnsOperation: 'update',
    dnsRecordId: id,
    username,
    type,
    fqdn,
    value,
  });
}

// Enqueue a new DNS Delete job
export async function addDeleteDnsRequest(
  data: Pick<DnsRecord, 'id' | 'username' | 'type' | 'value'> &
    Partial<Pick<DnsRecord, 'description' | 'course' | 'ports'>> &
    Subdomain
) {
  const { id, username, type, subdomain, value } = data;

  // Before running workflow, update record to pending in DB
  await updateDnsRecordById(id, { status: DnsRecordStatus.pending });

  const fqdn = buildDomain(username, subdomain);
  const jobName = `delete-dns-record:${fqdn}`;
  return addJob(jobName, {
    dnsOperation: 'delete',
    dnsRecordId: id,
    username,
    type,
    fqdn,
    value,
  });
}

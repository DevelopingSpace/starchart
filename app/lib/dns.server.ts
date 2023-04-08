import Filter from 'bad-words';
import isFQDN from 'validator/lib/isFQDN';
import isIP from 'validator/lib/isIP';
import isIPRange from 'validator/lib/isIPRange';

import { buildUserBaseDomain } from '~/utils';

import { DnsRecordType } from '@prisma/client';
import { z } from 'zod';

const filter = new Filter();

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

  // Decline if subdomain has inappropriate word(s)
  if (filter.isProfane(subdomain)) {
    return false;
  }

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

  // CNAME rule
  // 1. CNAME can be any non-empty string
  // 2. CNAME should not be IP address
  // 3. CNAME should be a proper domain name
  // 4. CNAME cannot contain _
  if (type === 'CNAME') {
    return !isIPRange(value) && isFQDN(value);
  }

  if (type === 'TXT') {
    // TXT records must be less than 4000, and we won't bother with empty
    return value.length > 0 && value.length <= 4000;
  }

  return false;
};

export const DnsRecordSchema = z
  .object({
    subdomain: z.string().min(1),
    type: z.nativeEnum(DnsRecordType),
    value: z.string().min(1),
    ports: z.string(),
    course: z.string(),
    description: z.string(),
  })
  .refine((data) => isValueValid(data.type, data.value), {
    message: 'Record value is invalid',
    path: ['value'],
  });

export const UpdateDnsRecordSchema = z.intersection(DnsRecordSchema, z.object({ id: z.string() }));

import {
  createHostedZone,
  createDnsRecord,
  upsertDnsRecord,
  deleteDnsRecord,
  getChangeStatus,
  isNameValid,
  isValueValid,
} from '~/lib/dns.server';
import { DnsRecordType } from '@prisma/client';

describe('DNS server lib function test', () => {
  let hostedZoneId: string;
  const rootDomain = 'starchart.com';
  const username = 'jdo12';

  const resetHostedZone = () => {
    try {
      fetch('http://localhost:5053/moto-api/reset', {
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Error occurred while deleting records in hosted zone: ${error}`);
    }
  };

  beforeAll(async () => {
    hostedZoneId = await createHostedZone(rootDomain);
    process.env.AWS_ROUTE53_HOSTED_ZONE_ID = hostedZoneId;
    process.env.ROOT_DOMAIN = rootDomain;
  });

  afterAll(() => resetHostedZone());

  test('Hosted zone is created and hosted zone is returned', () => {
    expect(hostedZoneId.length).toBeGreaterThan(0);
    expect(/^[A-Z0-9]+/.test(hostedZoneId)).toBe(true);
  });

  test('createDnsRecord() creates a DNS record in existing hosted zone and returns changeId', async () => {
    const changeId = await createDnsRecord(
      username,
      DnsRecordType.A,
      `_osd600.${username}.${rootDomain}`,
      '192.168.0.1'
    );
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('createDnsRecord() throws an error when invalid name or value is provided ', async () => {
    await expect(
      createDnsRecord(
        username,
        DnsRecordType.A,
        `invalid__domain.${username}.${rootDomain}`,
        '192.168.0.1'
      )
    ).rejects.toThrow();
    await expect(
      createDnsRecord(username, DnsRecordType.A, `osd700.${username}.${rootDomain}`, '192-168-0-1')
    ).rejects.toThrow();
    await expect(
      createDnsRecord(
        username,
        DnsRecordType.AAAA,
        `osd700.${username}.${rootDomain}`,
        '192.168.0.1'
      )
    ).rejects.toThrow();
  });

  test('upsertDnsRecord() updates an existing DNS record in hosted zone and returns changeId ', async () => {
    await createDnsRecord(
      username,
      DnsRecordType.A,
      `osd700.${username}.${rootDomain}`,
      '192.168.0.2'
    );
    const changeId = await upsertDnsRecord(
      username,
      DnsRecordType.AAAA,
      `osd700.${username}.${rootDomain}`,
      '2001:db8:3333:4444:5555:6666:7777:8888'
    );
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('upsertDnsRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      upsertDnsRecord(
        username,
        DnsRecordType.A,
        `invalid.domain.${username}.${rootDomain}`,
        '192.168.0.2'
      )
    ).rejects.toThrow();
    await expect(
      upsertDnsRecord(username, DnsRecordType.A, `osd600.${username}.${rootDomain}`, '192-168-0-2')
    ).rejects.toThrow();
    await expect(
      upsertDnsRecord(username, DnsRecordType.CNAME, `osd600.${username}.${rootDomain}`, '')
    ).rejects.toThrow();
  });

  test('deleteDnsRecord() deletes an existing record in hosted zone and returns changeId', async () => {
    await createDnsRecord(
      username,
      DnsRecordType.A,
      `to-be-deleted.${username}.${rootDomain}`,
      '192.168.0.0'
    );
    const changeId = await deleteDnsRecord(
      username,
      DnsRecordType.A,
      `to-be-deleted.${username}.${rootDomain}`,
      '192.168.0.0'
    );

    expect(changeId?.length).toBeGreaterThan(1);
  });

  test('deleteDnsRecord() returns null for Change ID when attempting to delete non existing record', async () => {
    const changeId = await deleteDnsRecord(
      username,
      DnsRecordType.A,
      `not-exist.${username}.${rootDomain}`,
      '192.168.0.1'
    );
    expect(changeId).toBe(null);
  });

  test('deleteDnsRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      deleteDnsRecord(
        username,
        DnsRecordType.A,
        `inv@lid_name.${username}.${rootDomain}`,
        '192.168.0.2'
      )
    ).rejects.toThrow();
    await expect(
      deleteDnsRecord(
        username,
        DnsRecordType.AAAA,
        `valid-name.${username}.${rootDomain}`,
        '192.168.0.2'
      )
    ).rejects.toThrow();
  });

  test('Get the status of the DNS record update using changeId', async () => {
    const changeId = await upsertDnsRecord(
      username,
      DnsRecordType.A,
      `osd700.${username}.${rootDomain}`,
      '192.168.0.2'
    );
    const status = await getChangeStatus(changeId!);

    expect(status).toEqual('INSYNC');
  });

  test('isNameValid() returns true when valid URL is passed. Otherwise it returns false', () => {
    expect(isNameValid(`osd700.${username}.${rootDomain}`, username)).toBeTruthy();
    expect(isNameValid(`osd-700.${username}.${rootDomain}`, username)).toBeTruthy();
    expect(isNameValid(`osd_700.${username}.${rootDomain}`, username)).toBeTruthy();
    expect(isNameValid(`_osd700.${username}.${rootDomain}`, username)).toBeTruthy();
    expect(isNameValid(`invalid__name.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd700..${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd..700.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd700.a2.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`-osd700.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd700-.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd700_.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd--700.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd__700.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd@700.${username}.${rootDomain}`, username)).toBeFalsy();
    expect(isNameValid(`osd-700.localhost`, username)).toBeFalsy();
    expect(isNameValid(`localhost`, username)).toBeFalsy();
  });

  test('isValueValue() return true when valid IP address is passed, otherwise returns false', () => {
    expect(isValueValid(DnsRecordType.A, '192.168.0.1')).toBe(true);
    expect(isValueValid(DnsRecordType.A, '0.0.0.0')).toBe(true);
    expect(isValueValid(DnsRecordType.AAAA, '2001:db8:3333:4444:5555:6666:7777:8888')).toBe(true);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:1')).toBe(true);
    expect(isValueValid(DnsRecordType.CNAME, 'test-domain')).toBe(true);

    expect(isValueValid(DnsRecordType.A, '192.168.0')).toBe(false);
    expect(isValueValid(DnsRecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(DnsRecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(DnsRecordType.A, 'a.b.c.d')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:1:')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'a:b:c:d:e:f:0:')).toBe(false);
    expect(isValueValid(DnsRecordType.AAAA, 'g:g:g:g:g:g:g:g')).toBe(false);
    expect(isValueValid(DnsRecordType.CNAME, '')).toBe(false);
  });
});

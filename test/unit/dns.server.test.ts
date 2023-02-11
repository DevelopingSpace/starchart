import {
  createHostedZone,
  createRecord,
  upsertRecord,
  deleteRecord,
  getChangeStatus,
} from '~/lib/dns.server';
import { RecordType } from '@prisma/client';

describe('DNS server lib function test', () => {
  let hostedZoneId: string;
  const rootDomain = 'starchart.com';
  const studentId = 'jdo12';

  beforeAll(async () => {
    hostedZoneId = await createHostedZone(rootDomain);
    process.env.AWS_ROUTE53_HOSTED_ZONE_ID = hostedZoneId;
  });

  test('Hosted zone is created and hosted zone is returned', () => {
    expect(hostedZoneId.length).toBeGreaterThan(0);
    expect(/^[A-Z0-9]+/.test(hostedZoneId)).toBe(true);
  });

  test('createRecord() creates a record in existing hosted zone and returns changeId', async () => {
    const changeId = await createRecord(RecordType.A, `my-domain.${rootDomain}`, '192.168.0.1');
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('createRecord() throws an error when invalid name or value is provided ', async () => {
    await expect(
      createRecord(RecordType.A, `invalid_domain.${studentId}.${rootDomain}`, '192.168.0.1')
    ).rejects.toThrow();
    await expect(
      createRecord(RecordType.A, `osd700.${studentId}.${rootDomain}`, '192-168-0-1')
    ).rejects.toThrow();
    await expect(
      createRecord(RecordType.AAAA, `osd700.${studentId}.${rootDomain}`, '192.168.0.1')
    ).rejects.toThrow();
  });

  test('upsertRecord() updates an existing record in hosted zone and returns changeId ', async () => {
    await createRecord(RecordType.A, `osd700.${studentId}.${rootDomain}`, '192.168.0.2');
    const changeId = await upsertRecord(
      RecordType.AAAA,
      `osd700.${studentId}.${rootDomain}`,
      '2001:db8:3333:4444:5555:6666:7777:8888'
    );
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('upsertRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      upsertRecord(RecordType.A, `invalid.domain.${studentId}.${rootDomain}`, '192.168.0.2')
    ).rejects.toThrow();
    await expect(
      upsertRecord(RecordType.A, `osd600.${studentId}.${rootDomain}`, '192-168-0-2')
    ).rejects.toThrow();
    await expect(
      upsertRecord(RecordType.CNAME, `osd600.${studentId}.${rootDomain}`, '')
    ).rejects.toThrow();
  });

  test('deleteRecord() deletes an existing record in hosted zone and returns changeId', async () => {
    await createRecord(RecordType.A, `to-be-deleted.${studentId}.${rootDomain}`, '192.168.0.0');
    const changeId = await deleteRecord(
      RecordType.A,
      `to-be-deleted.${studentId}.${rootDomain}`,
      '192.168.0.0'
    );

    expect(changeId.length).toBeGreaterThan(1);
  });

  test('deleteRecord() throws an error when attempting to delete non existing record', async () => {
    await expect(
      deleteRecord(RecordType.A, `not-exist.${studentId}.${rootDomain}`, '192.168.0.1')
    ).rejects.toThrow();
  });

  test('deleteRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      deleteRecord(RecordType.A, `invalid_name.${studentId}.${rootDomain}`, '192.168.0.2')
    ).rejects.toThrow();
    await expect(
      deleteRecord(RecordType.AAAA, `valid-name.${studentId}.${rootDomain}`, '192.168.0.2')
    ).rejects.toThrow();
  });

  test('Get the status of record update using changeId', async () => {
    const changeId = await upsertRecord(
      RecordType.A,
      `osd700.${studentId}.${rootDomain}`,
      '192.168.0.2'
    );
    const status = await getChangeStatus(changeId!);

    expect(status).toEqual('INSYNC');
  });
});

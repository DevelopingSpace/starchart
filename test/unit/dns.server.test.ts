import {
  createHostedZone,
  createRecord,
  upsertRecord,
  deleteRecord,
  getChangeStatus,
  isNameValid,
  isValueValid,
} from '~/lib/dns.server';
import { RecordType } from '@prisma/client';

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

  test('createRecord() creates a record in existing hosted zone and returns changeId', async () => {
    const changeId = await createRecord(
      username,
      RecordType.A,
      `_osd600.${username}.${rootDomain}`,
      '192.168.0.1'
    );
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('createRecord() throws an error when invalid name or value is provided ', async () => {
    await expect(
      createRecord(
        username,
        RecordType.A,
        `invalid__domain.${username}.${rootDomain}`,
        '192.168.0.1'
      )
    ).rejects.toThrow();
    await expect(
      createRecord(username, RecordType.A, `osd700.${username}.${rootDomain}`, '192-168-0-1')
    ).rejects.toThrow();
    await expect(
      createRecord(username, RecordType.AAAA, `osd700.${username}.${rootDomain}`, '192.168.0.1')
    ).rejects.toThrow();
  });

  test('upsertRecord() updates an existing record in hosted zone and returns changeId ', async () => {
    await createRecord(username, RecordType.A, `osd700.${username}.${rootDomain}`, '192.168.0.2');
    const changeId = await upsertRecord(
      username,
      RecordType.AAAA,
      `osd700.${username}.${rootDomain}`,
      '2001:db8:3333:4444:5555:6666:7777:8888'
    );
    expect(changeId.length).toBeGreaterThan(1);
  });

  test('upsertRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      upsertRecord(
        username,
        RecordType.A,
        `invalid.domain.${username}.${rootDomain}`,
        '192.168.0.2'
      )
    ).rejects.toThrow();
    await expect(
      upsertRecord(username, RecordType.A, `osd600.${username}.${rootDomain}`, '192-168-0-2')
    ).rejects.toThrow();
    await expect(
      upsertRecord(username, RecordType.CNAME, `osd600.${username}.${rootDomain}`, '')
    ).rejects.toThrow();
  });

  test('deleteRecord() deletes an existing record in hosted zone and returns changeId', async () => {
    await createRecord(
      username,
      RecordType.A,
      `to-be-deleted.${username}.${rootDomain}`,
      '192.168.0.0'
    );
    const changeId = await deleteRecord(
      username,
      RecordType.A,
      `to-be-deleted.${username}.${rootDomain}`,
      '192.168.0.0'
    );

    expect(changeId.length).toBeGreaterThan(1);
  });

  test('deleteRecord() throws an error when attempting to delete non existing record', async () => {
    await expect(
      deleteRecord(username, RecordType.A, `not-exist.${username}.${rootDomain}`, '192.168.0.1')
    ).rejects.toThrow();
  });

  test('deleteRecord() throws an error when invalid name or value is provided', async () => {
    await expect(
      deleteRecord(username, RecordType.A, `invalid_name.${username}.${rootDomain}`, '192.168.0.2')
    ).rejects.toThrow();
    await expect(
      deleteRecord(username, RecordType.AAAA, `valid-name.${username}.${rootDomain}`, '192.168.0.2')
    ).rejects.toThrow();
  });

  test('Get the status of record update using changeId', async () => {
    const changeId = await upsertRecord(
      username,
      RecordType.A,
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

  test('isValueValud() return true when valid IP address is passed, otherwise returns false', () => {
    expect(isValueValid(RecordType.A, '192.168.0.1')).toBe(true);
    expect(isValueValid(RecordType.A, '0.0.0.0')).toBe(true);
    expect(isValueValid(RecordType.AAAA, '2001:db8:3333:4444:5555:6666:7777:8888')).toBe(true);
    expect(isValueValid(RecordType.AAAA, 'a:b:c:d:e:f:0:1')).toBe(true);
    expect(isValueValid(RecordType.CNAME, 'test-domain')).toBe(true);

    expect(isValueValid(RecordType.A, '192.168.0')).toBe(false);
    expect(isValueValid(RecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(RecordType.A, '192.168.0.')).toBe(false);
    expect(isValueValid(RecordType.A, 'a.b.c.d')).toBe(false);
    expect(isValueValid(RecordType.AAAA, 'a:b:c:d:e:f:0:1:')).toBe(false);
    expect(isValueValid(RecordType.AAAA, 'a:b:c:d:e:f:0:')).toBe(false);
    expect(isValueValid(RecordType.AAAA, 'g:g:g:g:g:g:g:g')).toBe(false);
    expect(isValueValid(RecordType.CNAME, '')).toBe(false);
  });
});

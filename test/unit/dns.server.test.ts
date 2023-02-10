import {
  createHostedZone,
  createRecord,
  upsertRecord,
  deleteRecord,
  getChangeStatus,
  RecordType,
} from '~/lib/dns.server';

describe('DNS server lib function test', () => {
  let hostedZoneId: string;

  beforeAll(async () => {
    hostedZoneId = await createHostedZone('starchart.com');
  });

  afterAll(() => resetHostedZone());

  test('Hosted zone is created and hosted zone is returned', () => {
    expect(hostedZoneId.length).toBeGreaterThan(0);
    expect(/^[A-Z0-9]+/.test(hostedZoneId)).toBe(true);
  });

  test('createRecord() creates a record in existing hosted zone and returns changeId', async () => {
    const changeId = await createRecord(
      hostedZoneId,
      RecordType.A,
      'my-domain.starchart.com',
      '192.168.0.1'
    );
    expect(changeId?.length).toBeGreaterThan(1);
  });

  test('createRecord() throws an error when invalid hosted zone ID or name or value ', async () => {
    await expect(
      createRecord('WRONGHOSTEDZONEID', RecordType.A, 'sub2.starchart.com', '192.168.0.2')
    ).rejects.toThrow();
    await expect(
      createRecord(hostedZoneId, RecordType.A, 'invalid_domain.starchart.com', '192.168.0.1')
    ).rejects.toThrow();
    await expect(
      createRecord(hostedZoneId, RecordType.A, 'sub2.starchart.com', '192-168-0-1')
    ).rejects.toThrow();
    await expect(
      createRecord(hostedZoneId, RecordType.AAAA, 'sub2.starchart.com', '192.168.0.1')
    ).rejects.toThrow();
  });

  test('upsertRecord() updates an existing record in hosted zone and returns changeId ', async () => {
    await createRecord(hostedZoneId, RecordType.A, 'sub.starchart.com', '192.168.0.2');
    const changeId = await upsertRecord(
      hostedZoneId,
      RecordType.AAAA,
      'sub.starchart.com',
      '2001:db8:3333:4444:5555:6666:7777:8888'
    );
    expect(changeId?.length).toBeGreaterThan(1);
  });

  test('upsertRecord() throws an error when non existing hosted zone ID or invalid name or value was provided', async () => {
    await expect(
      upsertRecord('WRONGHOSTEDZONEID', RecordType.A, 'sub.starchart.com', '192.168.0.3')
    ).rejects.toThrow();
    await expect(
      upsertRecord(hostedZoneId, RecordType.A, 'invalid.domain.starchart.com', '192.168.0.2')
    ).rejects.toThrow();
    await expect(
      upsertRecord(hostedZoneId, RecordType.A, 'sub.starchart.com', '192-168-0-2')
    ).rejects.toThrow();
    await expect(
      upsertRecord(hostedZoneId, RecordType.CNAME, 'sub.starchart.com', '')
    ).rejects.toThrow();
  });

  test('deleteRecord() deletes an existing record in hosted zone and returns changeId', async () => {
    await createRecord(hostedZoneId, RecordType.A, 'to-be-deleted.starchart.com', '192.168.0.0');
    const changeId = await deleteRecord(
      hostedZoneId,
      RecordType.A,
      'to-be-deleted.starchart.com',
      '192.168.0.0'
    );

    expect(changeId.length).toBeGreaterThan(1);
  });

  test('deleteRecord() throws an error when attempting to delete non existing record', async () => {
    await expect(
      deleteRecord(hostedZoneId, RecordType.A, 'not-exist.starchart.com', '192.168.0.1')
    ).rejects.toThrow();
  });

  test('deleteRecord() throws an error when invalid hosted zone ID or invalid value is provided', async () => {
    await expect(
      deleteRecord(
        'WRONGHOSTEDZONEID',
        RecordType.A,
        'wrong-hosted-zone.starchart.com',
        '192.168.0.2'
      )
    ).rejects.toThrow();
    await expect(
      deleteRecord(hostedZoneId, RecordType.AAAA, 'wrong-hosted-zone.starchart.com', '192.168.0.2')
    ).rejects.toThrow();
  });

  test('Get the status of record update using changeId', async () => {
    const changeId = await upsertRecord(
      hostedZoneId,
      RecordType.A,
      'sub1.starchart.com',
      '192.168.0.2'
    );
    const status = await getChangeStatus(changeId!);

    expect(status).toEqual('INSYNC');
  });
});

const resetHostedZone = async () => {
  try {
    fetch('http://localhost:5053/moto-api/reset', {
      method: 'POST',
    });
  } catch (error) {
    throw new Error(`Error occurred while deleting records in hosted zone: ${error}`);
  }
};

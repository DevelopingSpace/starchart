import {
  createHostedZone,
  executeChangeSet,
  getDnsRecordSetPage,
} from 'services/reconciler/route53-client.server';

describe('Route53 Client functions test', () => {
  let hostedZoneId: string;
  const rootDomain = 'starchart.com';
  const username = 'jdo12';
  const fqdn = (subdomain: string = String(Date.now())) => `${subdomain}.${username}.${rootDomain}`;

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

  test('executeChangeSet single change', async () => {
    const changeId = await executeChangeSet([
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '192.168.2.1' }],
          TTL: 300,
          Type: 'A',
        },
      },
    ]);
    expect(typeof changeId).toBe('string');
  });

  test('executeChangeSet multiple changes', async () => {
    const changeId = await executeChangeSet([
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '192.168.2.1' }],
          TTL: 300,
          Type: 'A',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }],
          TTL: 300,
          Type: 'AAAA',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: 'google.com' }],
          TTL: 300,
          Type: 'CNAME',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '"hello world"' }],
          TTL: 300,
          Type: 'TXT',
        },
      },
    ]);
    expect(typeof changeId).toBe('string');
  });

  test('executeChangeSet with two TXT records with different values', async () => {
    const domain = fqdn('_acme-challenge');

    const changeId = await executeChangeSet([
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: domain,
          ResourceRecords: [{ Value: '"value1"' }],
          TTL: 300,
          Type: 'TXT',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: domain,
          ResourceRecords: [{ Value: '"value2"' }],
          TTL: 300,
          Type: 'TXT',
        },
      },
    ]);
    expect(typeof changeId).toBe('string');
  });

  test('executeChangeSet delete change', async () => {
    const domain = fqdn();

    // Create record
    const changeId1 = await executeChangeSet([
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: domain,
          ResourceRecords: [{ Value: '192.168.2.1' }],
          TTL: 300,
          Type: 'A',
        },
      },
    ]);
    expect(typeof changeId1).toBe('string');

    // Delete it
    const changeId2 = await executeChangeSet([
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: domain,
          ResourceRecords: [{ Value: '192.168.2.1' }],
          TTL: 300,
          Type: 'A',
        },
      },
    ]);
    expect(typeof changeId2).toBe('string');
  });

  test('getDnsRecordSetPage multiple records', async () => {
    const changes = [
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '192.168.2.1' }],
          TTL: 300,
          Type: 'A',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }],
          TTL: 300,
          Type: 'AAAA',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: 'google.com' }],
          TTL: 300,
          Type: 'CNAME',
        },
      },
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: fqdn(),
          ResourceRecords: [{ Value: '"hello world"' }],
          TTL: 300,
          Type: 'TXT',
        },
      },
    ];

    const changeId = await executeChangeSet(changes);
    expect(typeof changeId).toBe('string');

    const result = await getDnsRecordSetPage();

    // Clean up the returned results to match our changes, removing
    // any records in the zone that don't follow our pattern and
    // dropping the final .
    const actual = result.ResourceRecordSets?.filter(
      (rr) => rr.Name && /\d+.jdo12.starchart.com./.test(rr.Name)
    ).map((rr) => ({ ...rr, Name: rr.Name?.replace(/\.$/, '') }));

    // Make sure that we get back all the records we just added
    expect(actual).toEqual(
      expect.arrayContaining(changes.map((change) => change.ResourceRecordSet))
    );
  });
});

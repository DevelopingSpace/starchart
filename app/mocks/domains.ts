import type { Record } from '@prisma/client';

const DOMAINS_MOCK: Record[] = [
  {
    id: 123,
    username: 'some-username',
    name: 'name1',
    type: 'CNAME',
    value: 'github.com',
    description: 'lorem ipsum',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    status: 'active',
    course: null,
    ports: null,
  },
  {
    id: 321,
    username: 'some-username',
    name: 'name2',
    type: 'AAAA',
    value: '2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF',
    description: 'lorem ipsum',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    status: 'error',
    course: null,
    ports: null,
  },
  {
    id: 12312,
    username: 'some-username',
    name: 'name2',
    type: 'A',
    value: '2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF',
    description: 'lorem ipsum',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    status: 'pending',
    course: null,
    ports: null,
  },
];

export default DOMAINS_MOCK;

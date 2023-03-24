import { RecordStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '~/db.server';

import type { Record } from '@prisma/client';

export const createUserRecord = async (
  data: Pick<Record, 'username' | 'type' | 'subdomain' | 'value'>
) => {
  if (await doesRecordExist(data)) {
    throw new Error('Record already exists');
  }

  const result = await createRecord(data);

  if (!result) {
    throw new Error('Could not create a record in DB');
  }
  return result.id;
};

export function getRecordsByUsername(username: Record['username']) {
  return prisma.record.findMany({
    where: {
      username,
      NOT: {
        subdomain: {
          contains: '_acme',
        },
      },
    },
  });
}

export function getRecordById(id: Record['id']) {
  return prisma.record.findUnique({ where: { id } });
}

export function getUserRecordCount(username: Record['username']) {
  return prisma.record.count({
    where: {
      username,
    },
  });
}

export function createRecord(data: Pick<Record, 'username' | 'type' | 'subdomain' | 'value'>) {
  // Set expiration date 6 months from now
  const expiresAt = dayjs().set('month', 6).toDate();
  const status = RecordStatus.pending;

  return prisma.record.create({ data: { ...data, expiresAt, status } });
}

export function updateRecordById(
  data: Pick<Record, 'id' | 'type' | 'subdomain' | 'value'> &
    Partial<Pick<Record, 'description' | 'course' | 'ports'>>
) {
  const { id, ...values } = data;
  return prisma.record.update({
    where: { id },
    data: {
      ...values,
      expiresAt: dayjs().set('month', 6).toDate(),
    },
  });
}

export function updateRecordStatusById(id: Record['id'], status: Record['status']) {
  const expireToSet = dayjs().set('month', 6).toDate();
  return prisma.record.update({
    where: {
      id,
    },
    data: {
      status,
      expiresAt: status === RecordStatus.active ? expireToSet : undefined,
    },
  });
}

export function renewRecordById(id: Record['id']) {
  return prisma.record.update({
    where: {
      id,
    },
    data: {
      expiresAt: dayjs().set('month', 6).toDate(),
    },
  });
}

export async function doesRecordExist(
  data: Pick<Record, 'username' | 'type' | 'subdomain' | 'value'>
) {
  const { username, type, subdomain, value } = data;
  const count = await prisma.record.count({
    where: {
      username,
      type,
      subdomain,
      value,
    },
  });

  return count > 0;
}

export function deleteRecordById(id: Record['id']) {
  return prisma.record.delete({ where: { id } });
}

export function renewDnsRecordById(id: Record['id']) {
  const expiresAt = dayjs().set('month', 6).toDate();
  return prisma.record.update({
    where: {
      id,
    },
    data: {
      expiresAt,
    },
  });
}

export function getExpiredRecords() {
  return prisma.record.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

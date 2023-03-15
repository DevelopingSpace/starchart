import { RecordStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import dayjs from 'dayjs';

import type { Record } from '@prisma/client';
export type { Record } from '@prisma/client';

export async function getRecordsByUsername(username: Record['username']) {
  return prisma.record.findMany({ where: { username } });
}

export async function getRecordById(id: Record['id']) {
  return prisma.record.findUnique({ where: { id } });
}

export async function createRecord(data: Pick<Record, 'username' | 'type' | 'name' | 'value'>) {
  // Set expiration date 6 months from now
  const expiresAt = dayjs().set('month', 6).toDate();
  const status = RecordStatus.pending;

  return prisma.record.create({ data: { ...data, expiresAt, status } });
}

export async function updateRecordById(
  id: Record['id'],
  type?: Record['type'],
  name?: Record['name'],
  value?: Record['value'],
  status?: Record['status'],
  username?: Record['username'],
  description?: Record['description'],
  course?: Record['course'],
  ports?: Record['ports'],
  expiresAt?: Record['expiresAt'],
  lastNotified?: Record['lastNotified']
) {
  return prisma.record.update({
    where: { id },
    data: {
      type,
      name,
      value,
      status,
      username,
      description,
      course,
      ports,
      expiresAt,
      lastNotified,
    },
  });
}

export async function updateRecordStatusById(id: Record['id'], status: Record['status']) {
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

export async function doesRecordExist(data: Pick<Record, 'username' | 'type' | 'name' | 'value'>) {
  const { username, type, name, value } = data;
  const count = await prisma.record.count({
    where: {
      username,
      type,
      name,
      value,
    },
  });

  return count > 0;
}

export async function deleteRecordById(id: Record['id']) {
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

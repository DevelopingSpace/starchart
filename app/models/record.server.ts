import type { Record } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Record } from '@prisma/client';

export async function getRecordsByUsername(username: Record['username']) {
  return prisma.record.findMany({ where: { username } });
}

export async function getRecordById(id: Record['id']) {
  return prisma.record.findUnique({ where: { id } });
}

export async function createRecord(
  username: Record['username'],
  name: Record['name'],
  type: Record['type'],
  value: Record['value'],
  status: Record['status'],
  description?: Record['description'],
  course?: Record['course'],
  ports?: Record['ports']
) {
  // Set expiration date 6 months from now
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  return prisma.record.create({
    data: {
      username,
      name,
      type,
      value,
      description,
      course,
      ports,
      expiresAt,
      status,
    },
  });
}

export async function updateRecordById(
  id: Record['id'],
  username?: Record['username'],
  name?: Record['name'],
  type?: Record['type'],
  value?: Record['value'],
  description?: Record['description'],
  course?: Record['course'],
  ports?: Record['ports'],
  expiresAt?: Record['expiresAt'],
  status?: Record['status']
) {
  return prisma.record.update({
    where: { id },
    data: {
      username,
      name,
      type,
      value,
      description,
      course,
      ports,
      expiresAt,
      status,
    },
  });
}

export async function deleteRecordById(id: Record['id']) {
  return prisma.record.delete({ where: { id } });
}

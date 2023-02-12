import * as dns from './dns.server';
import { RecordStatus } from '@prisma/client';
import { prisma } from '~/db.server';

import type { RecordType, Record } from '@prisma/client';

interface DnsRecord {
  type: RecordType;
  name: string;
  value: string;
}

interface DomainRecord {
  id?: Record['id'];
  username?: Record['username'];
  description?: Record['description'];
  course?: Record['course'];
  ports?: Record['ports'];
}

type Domain = DnsRecord & DomainRecord;

export const createUserDomain = async (data: Domain) => {
  if (!data.username) {
    throw new Error('Username is not provided');
  }

  const existingRecords = await prisma.record.count({
    where: {
      name: data.name,
      type: data.type,
      value: data.value,
    },
  });

  if (existingRecords > 0) {
    throw new Error('Record already exists');
  }

  const [, result] = await Promise.all([
    dns.createRecord(data.type, data.name, data.value),
    prisma.record.create({
      data: {
        username: data.username,
        type: data.type,
        name: data.name,
        value: data.value,
        expiresAt: setMonthsFromNow(6),
        status: RecordStatus.pending,
      },
    }),
  ]);

  if (!result) {
    throw new Error('Could not create a record in DB');
  }
  return result;
};

export const updateUserDomain = async (data: Domain) => {
  const [, result] = await Promise.all([
    dns.upsertRecord(data.type, data.name, data.value),
    prisma.record.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        description: data.description,
        course: data.course,
        ports: data.ports,
        expiresAt: setMonthsFromNow(6),
        status: RecordStatus.pending,
      },
    }),
  ]);

  if (!result) {
    throw new Error('Could not update the record in DB');
  }
  return result;
};

export const deleteUserDomain = async (data: Domain) => {
  const [, result] = await Promise.all([
    dns.deleteRecord(data.type, data.name, data.value),
    prisma.record.delete({
      where: {
        id: data.id,
      },
    }),
  ]);

  if (!result) {
    throw new Error('Could not delete the record in DB');
  }
  return result;
};

export const removeIfExpired = async (data: Domain) => {
  const recordFromId = await prisma.record.findUnique({
    where: {
      id: data.id,
    },
  });

  if (!recordFromId) {
    throw new Error('Record with provided ID does not exist');
  }

  if (isExpired(recordFromId.expiresAt)) {
    const [, result] = await Promise.all([
      dns.deleteRecord(data.type, data.name, data.value),
      prisma.record.delete({
        where: {
          id: data.id,
        },
      }),
    ]);

    if (!result) {
      throw new Error('Could not delete the record in DB');
    }
    return result;
  }
};

export const isExpired = (expiresAt: Date) => expiresAt.getTime() < new Date().getTime();

export const willExpireIn = (expiresAt: Date, months: number = 1) =>
  new Date(expiresAt.setMonth(expiresAt.getMonth() - months)).getTime() < new Date().getTime();

export const setMonthsFromNow = (months: number) =>
  new Date(new Date().setMonth(new Date().getMonth() + months));

export type { Domain };

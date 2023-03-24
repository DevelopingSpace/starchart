import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Certificate } from '@prisma/client';

export async function getCertificateStatusByUsername(username: Certificate['username']) {
  return prisma.certificate
    .findMany({
      where: {
        username,
        OR: [{ status: 'issued' }, { status: 'pending' }, { status: 'failed' }],
      },
      orderBy: { id: 'desc' },
      take: 1,
    })
    .then(([certificate]) => {
      return certificate || {};
    });
}

export function getCertificateById(id: Certificate['id']) {
  return prisma.certificate.findUniqueOrThrow({ where: { id } });
}

export function createCertificate(data: Pick<Certificate, 'username' | 'domain' | 'orderUrl'>) {
  return prisma.certificate.create({ data: { ...data } });
}

export function updateCertificateById(
  id: number,
  data: Pick<Certificate, 'certificate' | 'privateKey' | 'validFrom' | 'validTo'>
) {
  return prisma.certificate.update({
    where: { id },
    data,
  });
}

export function deleteAllByUsername(username: Certificate['username']) {
  return prisma.certificate.deleteMany({ where: { username } });
}

export function deleteCertificateById(id: Certificate['id']) {
  return prisma.certificate.delete({ where: { id } });
}

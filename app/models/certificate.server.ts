import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Certificate } from '@prisma/client';

export function getIssuedCertificateByUsername(username: Certificate['username']) {
  // Get the most recently created one
  return prisma.certificate
    .findMany({
      where: { username, status: 'issued' },
      orderBy: { validFrom: 'desc' },
      take: 1,
    })
    .then(([certificate]) => certificate);
}

export function getCertificateById(id: Certificate['id']) {
  return prisma.certificate.findUnique({ where: { id } });
}

export async function createCertificate(
  data: Pick<Certificate, 'username' | 'domain' | 'orderUrl'>
) {
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

export function deleteCertificateById(id: Certificate['id']) {
  return prisma.certificate.delete({ where: { id } });
}

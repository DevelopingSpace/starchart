import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Certificate } from '@prisma/client';

export function getCertificateByUsername(username: Certificate['username']) {
  return prisma.certificate.findUnique({ where: { username } });
}

export function getCertificateById(id: Certificate['id']) {
  return prisma.certificate.findUnique({ where: { id } });
}

export async function createCertificate(
  data: Pick<Certificate, 'username' | 'domain' | 'orderUrl'>
) {
  return prisma.certificate.create({ data });
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

import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Certificate } from '@prisma/client';

export async function getCertificateByUsername(username: Certificate['username']) {
  return prisma.certificate.findUnique({ where: { username } });
}

export async function createCertificate(
  username: Certificate['username'],
  subject: Certificate['subject'],
  certificate: Certificate['certificate'],
  orderUrl: Certificate['orderUrl'],
  privateKey: Certificate['privateKey']
) {
  // Set expiration date 90 days from now
  const validTo = new Date();
  validTo.setDate(validTo.getDate() + 90);

  return prisma.certificate.create({
    data: {
      username,
      subject,
      certificate,
      orderUrl,
      privateKey,
      validTo,
    },
  });
}

export async function updateCertificateByUsername(
  username: Certificate['username'],
  subject?: Certificate['subject'],
  certificate?: Certificate['certificate'],
  orderUrl?: Certificate['orderUrl'],
  privateKey?: Certificate['privateKey'],
  validFrom?: Certificate['validFrom']
) {
  // If validFrom is changed, set validTo to 90 days from validFrom
  let validTo;
  if (validFrom) {
    validTo = validFrom;
    validTo.setDate(validTo.getDate() + 90);
  }
  return prisma.certificate.update({
    where: { username },
    data: {
      username,
      subject,
      certificate,
      orderUrl,
      privateKey,
      validFrom,
      validTo,
    },
  });
}

export async function deleteCertificateByUsername(username: Certificate['username']) {
  return prisma.certificate.delete({ where: { username } });
}

import type { Challenge } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Challenge } from '@prisma/client';

export function getChallengesByCertificateId(certificateId: Challenge['certificateId']) {
  return prisma.challenge.findMany({ where: { certificateId } });
}

export function createChallenge(
  data: Pick<Challenge, 'domain' | 'challengeKey' | 'certificateId'>
) {
  return prisma.challenge.create({ data });
}

export function deleteChallengeById(id: Challenge['id']) {
  return prisma.challenge.delete({ where: { id } });
}

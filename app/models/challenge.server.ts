import type { Challenge } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Challenge } from '@prisma/client';

export async function getChallengeByCertificateId(certificateId: Challenge['certificateId']) {
  return prisma.challenge.findMany({ where: { certificateId } });
}

export async function createChallenge(
  domain: Challenge['domain'],
  challengeKey: Challenge['challengeKey'],
  certificateId: Challenge['certificateId']
) {
  return prisma.challenge.create({
    data: {
      domain,
      challengeKey,
      certificateId,
    },
  });
}

export async function updateChallengeById(
  id: Challenge['id'],
  certificateId?: Challenge['certificateId'],
  domain?: Challenge['domain'],
  challengeKey?: Challenge['challengeKey']
) {
  return prisma.challenge.update({
    where: { id },
    data: {
      domain,
      challengeKey,
      certificateId,
    },
  });
}

export async function deleteChallengeById(id: Challenge['id']) {
  return prisma.challenge.delete({ where: { id } });
}

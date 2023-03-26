import { StateEnumType } from '@prisma/client';

import { prisma } from '~/db.server';

import type { SystemState } from '@prisma/client';

/**
 * The SystemState represents global (i.e., cross-instance), shared settings among Starchart instance(s).
 * Initially, this includes info on whether or not the DNS Reconciler needs to be run at the next opportunity.
 * We use this global SystemState to make sure that we stop hitting the Route53 API when no changes were made
 * to our Records table
 */

function initialize() {
  return prisma.systemState.create({
    data: {
      unique: StateEnumType.unique,
      reconciliationNeeded: true,
    },
  });
}

export function getIsReconciliationNeeded(): Promise<SystemState['reconciliationNeeded']> {
  return prisma.systemState
    .findUnique({
      select: { reconciliationNeeded: true },
      where: { unique: StateEnumType.unique },
    })
    .then((data) => data?.reconciliationNeeded ?? true);
}

export function setIsReconciliationNeeded(
  reconciliationNeeded: SystemState['reconciliationNeeded']
) {
  try {
    return prisma.systemState.update({
      data: { reconciliationNeeded },
      where: { unique: StateEnumType.unique },
    });
  } catch (error) {
    /**
     * This should never happen, as the table should always be seeded.
     * In case it isn't, let's seed it here Next queue run will set the
     * correct reconciliationNeeded
     */

    return initialize();
  }
}

import { StateEnumType } from '@prisma/client';

import { prisma } from '~/db.server';

import type { SystemState } from '@prisma/client';

/**
 * The SystemState represents global (i.e., cross-instance), shared settings among Starchart instance(s).
 * Initially, this includes info on whether or not the DNS Reconciler needs to be run at the next opportunity.
 * We use this global SystemState to make sure that we stop hitting the Route53 API when no changes were made
 * to our Records table
 */

export function getIsReconciliationNeeded(): Promise<SystemState['reconciliationNeeded']> {
  return prisma.systemState
    .findUnique({
      select: { reconciliationNeeded: true },
      where: { unique: StateEnumType.unique },
    })
    .then((data) => data!.reconciliationNeeded);
}

export function setIsReconciliationNeeded(
  reconciliationNeeded: SystemState['reconciliationNeeded']
) {
  return prisma.systemState.update({
    data: { reconciliationNeeded },
    where: { unique: StateEnumType.unique },
  });
}

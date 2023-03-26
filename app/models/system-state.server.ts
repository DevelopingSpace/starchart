import { StateEnumType } from '@prisma/client';

import { prisma } from '~/db.server';

import type { SystemState } from '@prisma/client';

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

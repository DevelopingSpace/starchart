import { StateEnumType } from '@prisma/client';

import { prisma } from '~/db.server';

import type { SystemState } from '@prisma/client';

/**
 * The SystemState represents global (i.e., cross-instance), shared settings among Starchart instance(s).
 * Initially, this includes info on whether or not the DNS Reconciler needs to be run at the next opportunity.
 * We use this global SystemState to make sure that we stop hitting the Route53 API when no changes were made
 * to our Records table
 */

export async function initialize() {
  try {
    // Using an upsert here to make sure we only initialize if the unique row is missing
    await prisma.systemState.upsert({
      where: { unique: StateEnumType.unique },
      update: {},
      create: {
        unique: StateEnumType.unique,
        reconciliationNeeded: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      // Row already exists, nothing to do
      return;
    }
    throw error;
  }
}

export function getIsReconciliationNeeded(): Promise<SystemState['reconciliationNeeded']> {
  return prisma.systemState
    .findUnique({
      select: { reconciliationNeeded: true },
      where: { unique: StateEnumType.unique },
    })
    .then((data) => data?.reconciliationNeeded ?? true);
}

export async function setIsReconciliationNeeded(
  reconciliationNeeded: SystemState['reconciliationNeeded']
) {
  try {
    await prisma.systemState.update({
      data: { reconciliationNeeded },
      where: { unique: StateEnumType.unique },
    });
  } catch {
    /**
     * This shouldn't happen, as the table should always be seeded.
     * In case it isn't, try to initialize it here.
     * If that also fails due to a concurrent insert (P2002),
     * just update, since the row now definitely exists.
     */
    try {
      await initialize();
    } catch (initError: unknown) {
      if (initError instanceof Error && 'code' in initError && initError.code === 'P2002') {
        // Another process created the row concurrently, just update it now
        await prisma.systemState.update({
          data: { reconciliationNeeded },
          where: { unique: StateEnumType.unique },
        });
      } else {
        throw initError;
      }
    }
  }
}

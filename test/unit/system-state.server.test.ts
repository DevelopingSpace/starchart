import {
  getIsReconciliationNeeded,
  initialize,
  setIsReconciliationNeeded,
} from '~/models/system-state.server';
import type { SystemState } from '@prisma/client';
import { prisma } from '~/db.server';

describe('initialize()', () => {
  let state: SystemState;
  beforeAll(async () => {
    state = await initialize();
  });

  afterAll(async () => {
    await prisma.systemState.deleteMany().catch(() => {});
  });

  test('can create system state', async () => {
    expect(typeof state).toEqual('object');
    expect(state.unique).toBe(`unique`);
    expect(state.reconciliationNeeded).toBe(true);
  });

  test('only one system state can exist', async () => {
    await expect(
      prisma.systemState.create({
        data: {},
      })
    ).rejects.toThrow();
    await expect(initialize()).rejects.toThrow();
  });
});

describe('getIsReconciliationNeeded()', () => {
  let state: SystemState;
  beforeAll(async () => {
    state = await initialize();
  });

  afterAll(async () => {
    await prisma.systemState.deleteMany().catch(() => {});
  });

  test('can get system state correctly', async () => {
    let result = await getIsReconciliationNeeded();
    expect(result).toBe(state.reconciliationNeeded);
  });

  test('can get system state correctly when it does not exist', async () => {
    await prisma.systemState.deleteMany().catch(() => {});
    let result = await getIsReconciliationNeeded();
    expect(result).toBe(true);
  });
});

describe('setIsReconciliationNeeded()', () => {
  beforeAll(async () => {
    await initialize();
  });

  afterAll(async () => {
    await prisma.systemState.deleteMany().catch(() => {});
  });

  test('can set system state correctly', async () => {
    await setIsReconciliationNeeded(false);
    let result = await getIsReconciliationNeeded();
    expect(result).toBe(false);
  });

  test('would throw error and initialize when system state does not exist', async () => {
    await prisma.systemState.deleteMany().catch(() => {});
    await expect(setIsReconciliationNeeded(false)).rejects.toThrow();

    let result = await getIsReconciliationNeeded();
    expect(result).toBe(true);
  });
});

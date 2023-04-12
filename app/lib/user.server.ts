import type { User } from '@prisma/client';
import { setIsReconciliationNeeded } from '~/models/system-state.server';
import { deleteUserByUsername } from '~/models/user.server';

export async function deleteUser(username: User['username']) {
  await deleteUserByUsername(username);
  setIsReconciliationNeeded(true);
}

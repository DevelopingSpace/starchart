import {
  createUser,
  checkUsernameExists,
  deactivateUserByUsername,
  deleteUserByUsername,
  isDeactivated,
} from '~/models/user.server';

import type { User } from '@prisma/client';

describe('deactivateUserByUsername()', () => {
  let user: User;

  beforeAll(async () => {
    user = await createUser('test_user_1', 'Test', 'testuser1@domain.com', 'test');
  });

  afterAll(async () => {
    await deleteUserByUsername(user.username);
  });

  test('sets deactivated flag to true', async () => {
    user = await deactivateUserByUsername(user.username);
    expect(user.deactivated).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  let user: User;

  beforeAll(async () => {
    user = await createUser('test_user_1', 'Test', 'testuser1@domain.com', 'test');
  });

  test('deletes user with provided username', async () => {
    await deleteUserByUsername(user.username);
    const userExists = await checkUsernameExists(user.username);
    expect(userExists).toBe(false);
  });
});

describe('isDeactivated()', () => {
  let activeUser: User;
  let deactivatedUser: User;

  beforeAll(async () => {
    activeUser = await createUser('test_user_1', 'Test', 'testuser2@domain.com', 'test');
    deactivatedUser = await createUser('test_user_2', 'Test', 'testuser3@domain.com', 'test');
    deactivatedUser = await deactivateUserByUsername(deactivatedUser.username);
  });

  afterAll(async () => {
    await deleteUserByUsername(activeUser.username);
    await deleteUserByUsername(deactivatedUser.username);
  });

  test('returns true for deactivated user', async () => {
    const result = await isDeactivated(deactivatedUser.username);
    expect(result).toBe(true);
  });

  test('returns false for active user', async () => {
    const result = await isDeactivated(activeUser.username);
    expect(result).toBe(false);
  });

  test('returns undefined when no user is found', async () => {
    const result = await isDeactivated('invalid username');
    expect(result).toBe(undefined);
  });
});

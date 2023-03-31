import {
  createUser,
  checkUsernameExists,
  deactivateUserByUsername,
  deleteUserByUsername,
  isUserDeactivated,
  getUserByUsername,
  isStudent,
  isAdmin,
  isFaculty,
} from '~/models/user.server';

import type { User } from '@prisma/client';
import { prisma } from '~/db.server';
import { buildUserBaseDomain } from '~/utils';

describe('createUser()', () => {
  let user: User;

  beforeAll(async () => {
    user = await createUser(
      'jsmith',
      'John Smith',
      'jsmith@myseneca.ca',
      'mycustomdomain-students'
    );
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('creates an User row with expected fields', async () => {
    expect(typeof user).toEqual('object');
    expect(user.username).toEqual('jsmith');
    expect(user.displayName).toEqual('John Smith');
    expect(user.email).toEqual('jsmith@myseneca.ca');
    expect(user.group).toEqual('mycustomdomain-students');
    expect(user.createdAt).not.toBe(null);
    expect(user.createdAt).toEqual(user.updatedAt);
    expect(user.deactivated).toBe(false);
  });

  test('creating an User with same username should throw error', async () => {
    await expect(
      createUser('jsmith', 'Joanna Smith', 'j-smith@myseneca.ca', 'mycustomdomain-admins')
    ).rejects.toThrow();
  });

  test('creating an User with same email should throw error', async () => {
    await expect(
      createUser('jsmith2', 'John Smith', 'jsmith@myseneca.ca', 'mycustomdomain-admins')
    ).rejects.toThrow();
  });
});

describe('deactivateUserByUsername()', () => {
  let user: User;

  beforeAll(async () => {
    user = await createUser('test_user_1', 'Test', 'testuser1@domain.com', 'test');
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('sets deactivated flag to true', async () => {
    user = await deactivateUserByUsername(user.username);
    expect(user.deactivated).toBe(true);
  });
});

describe('deleteUserByUsername()', () => {
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

describe('isUserDeactivated()', () => {
  let activeUser: User;
  let deactivatedUser: User;

  beforeAll(async () => {
    activeUser = await createUser('test_user_1', 'Test', 'testuser2@domain.com', 'test');
    deactivatedUser = await createUser('test_user_2', 'Test', 'testuser3@domain.com', 'test');
    deactivatedUser = await deactivateUserByUsername(deactivatedUser.username);
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('returns true for deactivated user', async () => {
    const result = await isUserDeactivated(deactivatedUser.username);
    expect(result).toBe(true);
  });

  test('returns false for active user', async () => {
    const result = await isUserDeactivated(activeUser.username);
    expect(result).toBe(false);
  });

  test('returns undefined when no user is found', async () => {
    const result = await isUserDeactivated('invalid username');
    expect(result).toBe(undefined);
  });
});

describe('getUserByUsername()', () => {
  beforeAll(async () => {
    await createUser('jsmith', 'John Smith', 'jsmith@myseneca.ca', 'mycustomdomain-students');
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('can return a user with baseDomain', async () => {
    const result = await getUserByUsername('jsmith');
    expect(result).not.toBe(null);
    expect(result!.username).toEqual('jsmith');
    expect(result!.displayName).toEqual('John Smith');
    expect(result!.email).toEqual('jsmith@myseneca.ca');
    expect(result!.group).toEqual('mycustomdomain-students');
    expect(result!.createdAt).not.toBe(null);
    expect(result!.createdAt).toEqual(result!.updatedAt);
    expect(result!.baseDomain).toEqual(buildUserBaseDomain('jsmith'));
  });

  test('should return null if user does not exist', async () => {
    const result = await getUserByUsername('amason');
    expect(result).toBe(null);
  });
});

describe('checkUsernameExists()', () => {
  beforeAll(async () => {
    await createUser('jsmith', 'John Smith', 'jsmith@myseneca.ca', 'mycustomdomain-students');
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('return true when a user exists', async () => {
    const result = await checkUsernameExists('jsmith');
    expect(result).toBe(true);
  });

  test('return false when user does not exist', async () => {
    const result = await checkUsernameExists('amason');
    expect(result).toBe(false);
  });
});

describe('Testing functions for group verification:', () => {
  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        {
          username: 'user1',
          displayName: 'Johannes Kepler',
          email: 'user1@myseneca.ca',
          group: 'mycustomdomain-faculty',
        },
        {
          username: 'user2',
          displayName: 'Galileo Galilei',
          email: 'user2@myseneca.ca',
          group: 'mycustomdomain-students',
        },
        {
          username: 'user3',
          displayName: 'Adam Mason',
          email: 'user3@myseneca.ca',
          group: 'mycustomdomain-admins',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany().catch(() => {});
  });

  test('isStudent() returns true for a student', async () => {
    const result = await isStudent('user2');
    expect(result).toBe(true);
  });

  test('isStudent() returns false for a non-student', async () => {
    const result = await isStudent('user1');
    expect(result).toBe(false);
  });

  test('isStudent() throws for a nonexistent user', async () => {
    await expect(isStudent('abc')).rejects.toThrow();
  });

  test('isAdmin() returns true for an admin', async () => {
    const result = await isAdmin('user3');
    expect(result).toBe(true);
  });

  test('isAdmin() returns false for a non-admin', async () => {
    const result = await isAdmin('user1');
    expect(result).toBe(false);
  });

  test('isAdmin() throws for a nonexistent user', async () => {
    await expect(isAdmin('abc')).rejects.toThrow();
  });

  test('isFaculty() returns true for a faculty', async () => {
    const result = await isFaculty('user1');
    expect(result).toBe(true);
  });

  test('isFaculty() returns false for a non-a faculty', async () => {
    const result = await isFaculty('user2');
    expect(result).toBe(false);
  });

  test('isFaculty() throws for a nonexistent user', async () => {
    await expect(isFaculty('abc')).rejects.toThrow();
  });
});

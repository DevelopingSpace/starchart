import {
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  useToast,
} from '@chakra-ui/react';
import type { Certificate, User } from '@prisma/client';
import { useSubmit } from '@remix-run/react';
import { useCallback, useEffect, useState } from 'react';
import { FaUsers, FaSearch, FaStickyNote } from 'react-icons/fa';
import { TbFileCertificate } from 'react-icons/tb';
import { typedjson, useTypedActionData, useTypedLoaderData } from 'remix-typedjson';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import AdminMetricCard from '~/components/admin/admin-metric-card';
import UsersTable from '~/components/admin/users-table';
import { getTotalCertificateCount, getCertificateByUsername } from '~/models/certificate.server';
import { getDnsRecordCountByUsername, getTotalDnsRecordCount } from '~/models/dns-record.server';
import { getTotalUserCount, searchUsers } from '~/models/user.server';
import { requireAdmin, startImpersonation } from '~/session.server';

import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { deleteUser } from '~/lib/user.server';

export type AdminActionIntent = 'search-users' | 'impersonate-user' | 'delete-user';

export interface UserWithMetrics extends User {
  dnsRecordCount: number;
  certificate?: Certificate;
}

export const MIN_USERS_SEARCH_TEXT = 3;

export const action = async ({ request }: ActionArgs) => {
  await requireAdmin(request);

  const actionParams = await parseFormSafe(
    request,
    z
      .object({
        intent: z.enum(['search-users', 'impersonate-user', 'delete-user']),
        searchText: z.string().min(MIN_USERS_SEARCH_TEXT).optional(),
        newEffectiveUsername: z.string().optional(),
        username: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.intent === 'search-users') {
            return !!data.searchText;
          }
          if (data.intent === 'impersonate-user') {
            return !!data.newEffectiveUsername;
          }
          if (data.intent === 'delete-user') {
            return !!data.username;
          }
          return false;
        },
        {
          message: 'A required field based on the intent is missing or empty.',
          path: [],
        }
      )
  );

  if (actionParams.success === false) {
    return { users: [] };
  }

  const { intent } = actionParams.data;
  switch (intent) {
    case 'search-users':
      const { searchText } = actionParams.data;

      const users = await searchUsers(searchText ?? '');
      const userStats = await Promise.all(
        users.map((user) =>
          Promise.all([
            getDnsRecordCountByUsername(user.username),
            getCertificateByUsername(user.username),
          ])
        )
      );

      const usersWithStats = users.map((user, index): UserWithMetrics => {
        const [dnsRecordCount, certificate] = userStats[index];

        return { ...user, dnsRecordCount, certificate };
      });

      return typedjson({ users: usersWithStats });
    case 'impersonate-user':
      const { newEffectiveUsername } = actionParams.data;
      if (!newEffectiveUsername) {
        throw new Response('Missing username for impersonation', { status: 400 });
      }
      return startImpersonation(request, newEffectiveUsername);
    case 'delete-user':
      const { username } = actionParams.data;
      await deleteUser(username ?? '');

      return typedjson({ isUserDeleted: true });
    default:
      return typedjson({ result: 'error', message: 'Unknown intent' });
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdmin(request);
  return {
    userCount: await getTotalUserCount(),
    dnsRecordCount: await getTotalDnsRecordCount(),
    certificateCount: await getTotalCertificateCount(),
  };
};

export default function AdminRoute() {
  const submit = useSubmit();

  const { userCount, dnsRecordCount, certificateCount } = useTypedLoaderData<typeof loader>();
  const actionResult = useTypedActionData<{ users?: UserWithMetrics[]; isUserDeleted?: boolean }>();

  const toast = useToast();

  const [searchText, setSearchText] = useState('');

  const reloadUsers = useCallback(() => {
    if (searchText.length >= MIN_USERS_SEARCH_TEXT) {
      const formData = new FormData();
      formData.append('searchText', searchText);
      formData.append('intent', 'search-users');

      submit(formData, { method: 'post' });
    }
  }, [searchText, submit]);

  useEffect(() => {
    if (actionResult?.isUserDeleted) {
      toast({
        title: 'User was deleted',
        position: 'bottom-right',
        status: 'success',
      });
      reloadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionResult?.isUserDeleted]);

  useEffect(() => {
    reloadUsers();
  }, [reloadUsers, searchText]);

  return (
    <>
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }}>
        Admin Dashboard
      </Heading>
      <Flex flexWrap="wrap">
        <AdminMetricCard
          name="Users"
          tooltipText="Total number of users"
          value={userCount}
          IconComponent={FaUsers}
        />
        <AdminMetricCard
          name="Certificates"
          tooltipText="Total number of certificates"
          value={certificateCount}
          IconComponent={TbFileCertificate}
        />
        <AdminMetricCard
          name="DNS Records"
          tooltipText="Total number of DNS records"
          value={dnsRecordCount}
          IconComponent={FaStickyNote}
        />
      </Flex>
      <Heading as="h2" size={{ base: 'lg', md: 'xl' }} mt="8" mb="4">
        Users
      </Heading>

      <FormControl>
        <InputGroup width={{ sm: '100%', md: 300 }}>
          <InputLeftAddon children={<FaSearch />} />
          <Input
            placeholder="Search..."
            name="searchText"
            value={searchText}
            onChange={(event) => setSearchText(event.currentTarget.value)}
          />
        </InputGroup>
        <FormHelperText>Please enter at least 3 characters to search.</FormHelperText>
      </FormControl>

      <UsersTable users={actionResult?.users ?? []} searchText={searchText} />
    </>
  );
}

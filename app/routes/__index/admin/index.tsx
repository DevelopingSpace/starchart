import {
  Container,
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import type { Certificate, User } from '@prisma/client';
import { redirect } from '@remix-run/node';
import { Form, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { FaUsers, FaSearch, FaStickyNote } from 'react-icons/fa';
import { TbFileCertificate } from 'react-icons/tb';
import { useTypedActionData, useTypedLoaderData } from 'remix-typedjson';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import AdminMetricCard from '~/components/admin/admin-metric-card';
import UsersTable from '~/components/admin/users-table';
import { getTotalCertificateCount, getCertificateByUsername } from '~/models/certificate.server';
import { getDnsRecordCountByUsername, getTotalDnsRecordCount } from '~/models/dns-record.server';
import { getTotalUserCount, isUserDeactivated, searchUsers } from '~/models/user.server';
import { requireAdmin, setEffectiveUsername } from '~/session.server';

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

export interface UserWithMetrics extends User {
  dnsRecordCount: number;
  certificate?: Certificate;
}

export const MIN_USERS_SEARCH_TEXT = 3;

export const action = async ({ request }: ActionArgs) => {
  const admin = await requireAdmin(request);
  const formData = await request.formData();
  const newEffectiveUsername = formData.get('newEffectiveUsername');
  if (typeof newEffectiveUsername === 'string') {
    if (await isUserDeactivated(newEffectiveUsername)) {
      return redirect('/');
    }
    return redirect('/', {
      headers: {
        'Set-Cookie': await setEffectiveUsername(admin.username, newEffectiveUsername),
      },
    });
  }

  const actionParams = await parseFormSafe(
    formData,
    z.object({
      searchText: z.string().min(MIN_USERS_SEARCH_TEXT),
    })
  );
  if (actionParams.success === false) {
    return [];
  }

  const { searchText } = actionParams.data;

  const users = await searchUsers(searchText);
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

  return usersWithStats;
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
  const users = useTypedActionData<UserWithMetrics[] | null>();

  const [searchText, setSearchText] = useState('');

  function onFormChange(event: any) {
    if (searchText.length >= MIN_USERS_SEARCH_TEXT) {
      submit(event.currentTarget);
    }
  }

  return (
    <Container maxW="container.xl">
      <Heading as="h1" size="xl" mt="8">
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
      <Heading as="h2" size="xl" mt="8" mb="4">
        Users
      </Heading>
      <Form method="post" onChange={onFormChange}>
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
      </Form>
      <UsersTable users={users ?? []} searchText={searchText} />
    </Container>
  );
}

import { Table, Card, IconButton, Flex, HStack, Spinner, Text } from '@chakra-ui/react';
import { FaRegTrashCan, FaMasksTheater } from 'react-icons/fa6';
import { Form, useNavigation } from '@remix-run/react';
import { Tooltip } from '~/components/ui/tooltip';

import type { UserWithMetrics } from '~/routes/_auth.admin._index';
import { MIN_USERS_SEARCH_TEXT } from '~/routes/_auth.admin._index';

import CertificateStatusIcon from '~/components/admin/certificate-status-icon';
import { useUser } from '~/utils';

interface UsersTableProps {
  users: UserWithMetrics[];
  searchText: string;
}

export default function UsersTable({ users, searchText }: UsersTableProps) {
  const navigation = useNavigation();
  const { username } = useUser();

  const isInputValid = searchText.length >= MIN_USERS_SEARCH_TEXT;
  const isLoading = navigation.state === 'submitting';

  const shouldShowInstruction = !isInputValid && !isLoading;
  const shouldShowNoUsersMessage = users.length === 0 && isInputValid && !isLoading;
  const shouldShowUsers = !(isLoading || shouldShowInstruction || shouldShowNoUsersMessage);

  return (
    <Card.Root p="2" mt="4">
      <Table.Root colorScheme="gray">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>DNS Records</Table.ColumnHeader>
            <Table.ColumnHeader>Certificate status</Table.ColumnHeader>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!shouldShowUsers && (
            <Table.Row>
              <Table.Cell py="8" colSpan={7}>
                <Flex justifyContent="center">
                  {isLoading && <Spinner />}
                  {shouldShowInstruction && !isLoading && (
                    <Text>Please enter at least 3 characters to search</Text>
                  )}
                  {shouldShowNoUsersMessage && !isLoading && <Text>No users found</Text>}
                </Flex>
              </Table.Cell>
            </Table.Row>
          )}

          {shouldShowUsers &&
            users.map((user) => {
              return (
                <Table.Row key={user.email}>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.displayName}</Table.Cell>
                  <Table.Cell>{user.dnsRecordCount}</Table.Cell>
                  <Table.Cell>
                    <CertificateStatusIcon status={user.certificate?.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <HStack>
                      <Tooltip content="Impersonate user">
                        <Form method="post">
                          <input type="hidden" name="newEffectiveUsername" value={user.username} />
                          <input type="hidden" name="intent" value="impersonate-user" />
                          <IconButton
                            type="submit"
                            aria-label="Impersonate user"
                            variant="ghost"
                            disabled={user.username === username}
                          >
                            <FaMasksTheater color="black" size={24} />
                          </IconButton>
                        </Form>
                      </Tooltip>
                      <Form method="post">
                        <Tooltip content="Delete user">
                          <IconButton
                            aria-label="Delete user"
                            variant="ghost"
                            disabled={user.username === username}
                            type="submit"
                          >
                            <FaRegTrashCan color="black" size={24} />
                          </IconButton>
                        </Tooltip>
                        <input type="hidden" name="username" value={user.username} />
                        <input type="hidden" name="intent" value="delete-user" />
                      </Form>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table.Root>
    </Card.Root>
  );
}

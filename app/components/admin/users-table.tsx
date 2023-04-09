import {
  Table,
  Tr,
  Th,
  Thead,
  Tbody,
  TableContainer,
  Td,
  Card,
  IconButton,
  Tooltip,
  useToast,
  Flex,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaTheaterMasks } from 'react-icons/fa';
import { Form, useNavigation } from '@remix-run/react';

import type { UserWithMetrics } from '~/routes/__index/admin';
import { MIN_USERS_SEARCH_TEXT } from '~/routes/__index/admin';

import CertificateStatusIcon from '~/components/admin/certificate-status-icon';

interface UsersTableProps {
  users: UserWithMetrics[];
  searchText: string;
}

export default function UsersTable({ users, searchText }: UsersTableProps) {
  const toast = useToast();
  const navigation = useNavigation();

  function onCopyNameToClipboard(subdomain: string) {
    navigator.clipboard.writeText(subdomain);
    toast({
      title: 'Email was copied to clipboard',
      position: 'bottom-right',
      status: 'success',
    });
  }

  const isInputValid = searchText.length >= MIN_USERS_SEARCH_TEXT;
  const isLoading = navigation.state === 'submitting';

  const shouldShowInstruction = users.length === 0 && !isInputValid && !isLoading;
  const shouldShowNoUsersMessage = users.length === 0 && isInputValid && !isLoading;
  const shouldShowUsers = !(isLoading || shouldShowInstruction || shouldShowNoUsersMessage);

  return (
    <Card p="2" mt="4">
      <TableContainer>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>DNS Records</Th>
              <Th>Certificate status</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {!shouldShowUsers && (
              <Tr>
                <Td py="8" colSpan={7}>
                  <Flex justifyContent="center">
                    {isLoading && <Spinner />}
                    {shouldShowInstruction && !isLoading && (
                      <Text>Please enter at least 3 characters to search</Text>
                    )}
                    {shouldShowNoUsersMessage && !isLoading && <Text>No users found</Text>}
                  </Flex>
                </Td>
              </Tr>
            )}

            {shouldShowUsers &&
              users.map((user) => {
                return (
                  <Tr key={user.email}>
                    <Td>
                      <Flex justifyContent="space-between" alignItems="center">
                        {user.email}
                        <Tooltip label="Copy email to clipboard">
                          <IconButton
                            icon={<CopyIcon color="black" boxSize="5" />}
                            variant="ghost"
                            ml="2"
                            onClick={() => onCopyNameToClipboard(user.email)}
                            aria-label="copy email"
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                    <Td>{user.displayName}</Td>
                    <Td>{user.dnsRecordCount}</Td>
                    <Td>
                      <CertificateStatusIcon status={user.certificate?.status} />
                    </Td>
                    <Td>
                      <HStack>
                        <Tooltip label="Impersonate user">
                          <Form method="post">
                            <input
                              type="hidden"
                              name="newEffectiveUsername"
                              value={user.username}
                            />
                            <IconButton
                              type="submit"
                              aria-label="Impersonate user"
                              icon={<FaTheaterMasks color="black" size={24} />}
                              variant="ghost"
                            />
                          </Form>
                        </Tooltip>
                        <Tooltip label="Deactivate user">
                          <IconButton
                            aria-label="Deactivate user"
                            icon={<DeleteIcon color="black" boxSize={5} />}
                            variant="ghost"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
}

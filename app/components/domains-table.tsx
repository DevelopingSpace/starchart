import { useState } from 'react';
import {
  Table,
  Tr,
  Th,
  Thead,
  Tbody,
  TableContainer,
  Td,
  IconButton,
  Flex,
  Tooltip,
  Card,
  useToast,
  useDisclosure,
  Spinner,
  Text,
} from '@chakra-ui/react';
import type { Record, RecordStatus } from '@prisma/client';
import {
  EditIcon,
  DeleteIcon,
  CheckCircleIcon,
  RepeatIcon,
  CopyIcon,
  TimeIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import RecordDeleteAlertDialog from './record-delete-alert-dialog';

import { Form, useNavigate, useTransition } from '@remix-run/react';

interface DomainsTableProps {
  domains: Record[];
}

export default function DomainsTable(props: DomainsTableProps) {
  const { domains } = props;

  const toast = useToast();
  const navigate = useNavigate();
  const transition = useTransition();

  const {
    isOpen: isDeleteAlertDialogOpen,
    onOpen: onDeleteAlerDialogOpen,
    onClose: onDeleteAlertDialogClose,
  } = useDisclosure();
  const [domainToDelete, setDomainToDelete] = useState<Record | undefined>();

  function onCopyNameToClipboard(name: string) {
    navigator.clipboard.writeText(name);
    toast({
      title: 'Name was copied to clipboard',
      position: 'bottom-right',
      status: 'success',
    });
  }

  function renderDomainStatus(action: RecordStatus) {
    if (action === 'active') {
      return (
        <Tooltip label="Domain is live">
          <CheckCircleIcon color="green.500" boxSize="6" />
        </Tooltip>
      );
    }
    if (action === 'error') {
      return (
        <Tooltip label="Domain error">
          <WarningIcon color="brand.500" boxSize="6" />
        </Tooltip>
      );
    }
    if (action === 'pending') {
      return (
        <Tooltip label="Domain is pending">
          <Flex
            width="6"
            height="6"
            borderRadius="20"
            alignItems="center"
            justifyContent="center"
            background="yellow.500"
          >
            <TimeIcon color="white" boxSize="3" />
          </Flex>
        </Tooltip>
      );
    }
  }

  function renderDnsRecordName(domainName: string) {
    const words = domainName.split('.');
    const [nameBase, ...restOfName] = words;

    return (
      <Flex alignItems="flex-end" flexDirection="row">
        <Text>
          <Text as="span" sx={{ fontWeight: 'medium' }}>
            {nameBase}
          </Text>
          <Text as="span" color="gray.500">
            .{restOfName}
          </Text>
        </Text>
      </Flex>
    );
  }

  function onDeleteDomainOpen(domain: Record) {
    onDeleteAlerDialogOpen();
    setDomainToDelete(domain);
  }

  function onDomainDeleteCancel() {
    onDeleteAlertDialogClose();
    setDomainToDelete(undefined);
  }

  function onDomainDeleteConfirm() {
    onDeleteAlertDialogClose();
    setDomainToDelete(undefined);
  }

  function onDnsRecordEdit(dnsRecord: Record) {
    navigate(dnsRecord.id.toString());
  }

  return (
    <>
      <Card p="2" mt="4">
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th />
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Value</Th>
                <Th>Expiration date</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {domains.map((domain) => {
                const isLoading =
                  transition.state === 'submitting' &&
                  Number(transition.submission.formData.get('id')) === domain.id;

                return (
                  <Tr key={domain.id}>
                    {isLoading ? (
                      <Td py="8" colSpan={7}>
                        <Flex justifyContent="center">
                          <Spinner />
                        </Flex>
                      </Td>
                    ) : (
                      <>
                        <Td>{renderDomainStatus(domain.status)}</Td>
                        <Td>
                          <Flex justifyContent="space-between" alignItems="center">
                            {renderDnsRecordName(domain.name)}
                            <Tooltip label="Copy name to clipboard">
                              <IconButton
                                icon={<CopyIcon color="black" boxSize="5" />}
                                aria-label="Refresh domain"
                                variant="ghost"
                                ml="2"
                                onClick={() => onCopyNameToClipboard(domain.name)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                        <Td>{domain.type}</Td>
                        <Td>{domain.value}</Td>
                        <Td>
                          <Flex justifyContent="space-between" alignItems="center">
                            {domain.expiresAt.toLocaleDateString('en-US')}
                            <Form method="patch" style={{ margin: 0 }}>
                              <input type="hidden" name="id" value={domain.id} />
                              <input type="hidden" name="intent" value="renew-record" />
                              <Tooltip label="Renew domain">
                                <IconButton
                                  icon={<RepeatIcon color="black" boxSize="5" />}
                                  aria-label="Refresh domain"
                                  variant="ghost"
                                  type="submit"
                                />
                              </Tooltip>
                            </Form>
                          </Flex>
                        </Td>
                        <Td>
                          <Flex>
                            <Tooltip label="Edit domain">
                              <IconButton
                                onClick={() => onDnsRecordEdit(domain)}
                                icon={<EditIcon color="black" boxSize={5} />}
                                aria-label="Edit domain"
                                variant="ghost"
                                mr="1"
                              />
                            </Tooltip>
                            <Tooltip label="Delete domain">
                              <IconButton
                                onClick={() => onDeleteDomainOpen(domain)}
                                icon={<DeleteIcon color="black" boxSize={5} />}
                                aria-label="Delete domain"
                                variant="ghost"
                                type="submit"
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                      </>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
      <RecordDeleteAlertDialog
        isOpen={isDeleteAlertDialogOpen}
        onCancel={onDomainDeleteCancel}
        onConfirm={onDomainDeleteConfirm}
        dnsRecord={domainToDelete}
      />
    </>
  );
}

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
import DnsRecordName from './dns-record/dns-record-name';
import { useUser } from '~/utils';

interface DnsRecordsTableProps {
  dnsRecords: Record[];
}

export default function DnsRecordsTable(props: DnsRecordsTableProps) {
  const { dnsRecords } = props;

  const { baseDomain } = useUser();

  const toast = useToast();
  const navigate = useNavigate();
  const transition = useTransition();

  const {
    isOpen: isDeleteAlertDialogOpen,
    onOpen: onDeleteAlertDialogOpen,
    onClose: onDeleteAlertDialogClose,
  } = useDisclosure();
  const [dnsRecordToDelete, setDnsRecordToDelete] = useState<Record | undefined>();

  function onCopyNameToClipboard(subdomain: string) {
    navigator.clipboard.writeText(subdomain);
    toast({
      title: 'Name was copied to clipboard',
      position: 'bottom-right',
      status: 'success',
    });
  }

  function renderDnsRecordStatus(action: RecordStatus) {
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

  function onDeleteDnsRecordOpen(dnsRecord: Record) {
    onDeleteAlertDialogOpen();
    setDnsRecordToDelete(dnsRecord);
  }

  function onDnsRecordDeleteCancel() {
    onDeleteAlertDialogClose();
    setDnsRecordToDelete(undefined);
  }

  function onDnsRecordDeleteConfirm() {
    onDeleteAlertDialogClose();
    setDnsRecordToDelete(undefined);
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
              {dnsRecords.map((dnsRecord) => {
                const isLoading =
                  transition.state === 'submitting' &&
                  Number(transition.submission.formData.get('id')) === dnsRecord.id;

                return (
                  <Tr key={dnsRecord.id}>
                    {isLoading ? (
                      <Td py="8" colSpan={7}>
                        <Flex justifyContent="center">
                          <Spinner />
                        </Flex>
                      </Td>
                    ) : (
                      <>
                        <Td>{renderDnsRecordStatus(dnsRecord.status)}</Td>
                        <Td>
                          <Flex justifyContent="space-between" alignItems="center">
                            <DnsRecordName
                              subdomain={dnsRecord.subdomain}
                              baseDomain={baseDomain}
                            />
                            <Tooltip label="Copy name to clipboard">
                              <IconButton
                                icon={<CopyIcon color="black" boxSize="5" />}
                                aria-label="Refresh domain"
                                variant="ghost"
                                ml="2"
                                onClick={() => onCopyNameToClipboard(dnsRecord.subdomain)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                        <Td>{dnsRecord.type}</Td>
                        <Td>{dnsRecord.value}</Td>
                        <Td>
                          <Flex justifyContent="space-between" alignItems="center">
                            {dnsRecord.expiresAt.toLocaleDateString('en-US')}
                            <Form method="patch" style={{ margin: 0 }}>
                              <input type="hidden" name="id" value={dnsRecord.id} />
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
                                onClick={() => onDnsRecordEdit(dnsRecord)}
                                icon={<EditIcon color="black" boxSize={5} />}
                                aria-label="Edit domain"
                                variant="ghost"
                                mr="1"
                              />
                            </Tooltip>
                            <Tooltip label="Delete domain">
                              <IconButton
                                onClick={() => onDeleteDnsRecordOpen(dnsRecord)}
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
        onCancel={onDnsRecordDeleteCancel}
        onConfirm={onDnsRecordDeleteConfirm}
        dnsRecord={dnsRecordToDelete}
      />
    </>
  );
}

import { useState } from 'react';
import {
  Table,
  Tr,
  Th,
  Text,
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
  HStack,
} from '@chakra-ui/react';
import type { DnsRecord } from '@prisma/client';
import { EditIcon, DeleteIcon, RepeatIcon, CopyIcon } from '@chakra-ui/icons';
import DnsRecordDeleteAlertDialog from './dns-record-delete-alert-dialog';

import { Form, useNavigate, useTransition } from '@remix-run/react';
import DnsRecordName from './dns-record/dns-record-name';
import { useEffectiveUser } from '~/utils';
import dayjs from 'dayjs';

interface DnsRecordsTableProps {
  dnsRecords: DnsRecord[];
}

export default function DnsRecordsTable(props: DnsRecordsTableProps) {
  const { dnsRecords } = props;

  const { baseDomain } = useEffectiveUser();

  const toast = useToast();
  const navigate = useNavigate();
  const transition = useTransition();

  const {
    isOpen: isDeleteAlertDialogOpen,
    onOpen: onDeleteAlertDialogOpen,
    onClose: onDeleteAlertDialogClose,
  } = useDisclosure();
  const [dnsRecordToDelete, setDnsRecordToDelete] = useState<DnsRecord | undefined>();

  function onCopyNameToClipboard(domain: string) {
    navigator.clipboard.writeText(domain);
    toast({
      title: 'DNS Record was copied to clipboard',
      position: 'bottom-right',
      status: 'success',
    });
  }

  function onDeleteDnsRecordOpen(dnsRecord: DnsRecord) {
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

  function onDnsRecordEdit(dnsRecord: DnsRecord) {
    navigate(dnsRecord.id.toString());
  }

  return (
    <>
      <Card p="2" mt="4">
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>DNS Record</Th>
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
                const isRenewable = dayjs(dnsRecord.expiresAt).isBefore(dayjs().add(6, 'month'));

                return isLoading ? (
                  <Tr key={dnsRecord.id}>
                    <Td py="8" colSpan={7}>
                      <Flex justifyContent="center">
                        <Spinner />
                      </Flex>
                    </Td>
                  </Tr>
                ) : (
                  <Tr key={dnsRecord.id}>
                    <Td>
                      <Flex justifyContent="space-between" alignItems="center">
                        <DnsRecordName dnsRecord={dnsRecord} baseDomain={baseDomain} />
                        <Tooltip label="Copy subdomain to clipboard">
                          <IconButton
                            icon={<CopyIcon color="black" boxSize="5" />}
                            aria-label="Refresh DNS record"
                            variant="ghost"
                            ml="2"
                            onClick={() =>
                              onCopyNameToClipboard(`${dnsRecord.subdomain}.${baseDomain}`)
                            }
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                    <Td>{dnsRecord.type}</Td>
                    <Td>
                      <Tooltip label={dnsRecord.value}>
                        <Text isTruncated maxWidth="20ch">
                          {dnsRecord.value}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Flex alignItems="center">
                        {dnsRecord.expiresAt.toLocaleDateString('en-US')}
                        <Form method="patch" style={{ margin: 0 }}>
                          <input type="hidden" name="id" value={dnsRecord.id} />
                          <input type="hidden" name="intent" value="renew-dns-record" />
                          <Tooltip label="Renew DNS record">
                            <IconButton
                              icon={<RepeatIcon color="black" boxSize="5" />}
                              aria-label="Refresh DNS record"
                              variant="ghost"
                              type="submit"
                              isDisabled={!isRenewable}
                            />
                          </Tooltip>
                        </Form>
                      </Flex>
                    </Td>
                    <Td>
                      <HStack>
                        <Tooltip label="Edit DNS record">
                          <IconButton
                            onClick={() => onDnsRecordEdit(dnsRecord)}
                            icon={<EditIcon color="black" boxSize={5} />}
                            aria-label="Edit DNS record"
                            variant="ghost"
                            mr="1"
                          />
                        </Tooltip>
                        <Tooltip label="Delete DNS record">
                          <IconButton
                            onClick={() => onDeleteDnsRecordOpen(dnsRecord)}
                            icon={<DeleteIcon color="black" boxSize={5} />}
                            aria-label="Delete DNS record"
                            variant="ghost"
                            type="submit"
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
      <DnsRecordDeleteAlertDialog
        isOpen={isDeleteAlertDialogOpen}
        onCancel={onDnsRecordDeleteCancel}
        onConfirm={onDnsRecordDeleteConfirm}
        dnsRecord={dnsRecordToDelete}
      />
    </>
  );
}

import { useState } from 'react';
import {
  Table,
  Tr,
  Th,
  Thead,
  Tbody,
  TableContainer,
  Td,
  Flex,
  Card,
  useToast,
  useDisclosure,
  Spinner,
  Hide,
} from '@chakra-ui/react';
import { useNavigation } from '@remix-run/react';

import DnsRecordDeleteAlertDialog from './dns-record-delete-alert-dialog';
import DnsRecordsTableRow from './dns-record-table-row';

import type { DnsRecord } from '@prisma/client';

interface DnsRecordsTableProps {
  dnsRecords: DnsRecord[];
}

export default function DnsRecordsTable({ dnsRecords }: DnsRecordsTableProps) {
  const toast = useToast();
  const navigation = useNavigation();
  const {
    isOpen: isDeleteAlertDialogOpen,
    onOpen: onDeleteAlertDialogOpen,
    onClose: onDeleteAlertDialogClose,
  } = useDisclosure();
  const [dnsRecordToDelete, setDnsRecordToDelete] = useState<DnsRecord | undefined>();

  function onCopied() {
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

  return (
    <>
      <Card p="2" mt="4">
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>DNS Record</Th>
                <Hide below="sm">
                  <Th>Type</Th>
                  <Th>Value</Th>
                  <Th>Expiration date</Th>
                  <Th />
                </Hide>
              </Tr>
            </Thead>
            <Tbody>
              {dnsRecords.map((dnsRecord) => {
                const isLoading =
                  navigation.state === 'submitting' &&
                  Number(navigation.formData.get('id')) === dnsRecord.id;

                return isLoading ? (
                  <Tr key={dnsRecord.id}>
                    <Td py="8" colSpan={7}>
                      <Flex justifyContent="center">
                        <Spinner />
                      </Flex>
                    </Td>
                  </Tr>
                ) : (
                  <DnsRecordsTableRow
                    key={dnsRecord.id}
                    dnsRecord={dnsRecord}
                    onDelete={onDeleteDnsRecordOpen}
                    onCopied={onCopied}
                  />
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

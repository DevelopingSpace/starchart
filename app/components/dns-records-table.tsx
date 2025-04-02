import { useState } from 'react';
import {
  Table,
  Flex,
  Card,
  useDisclosure,
  Spinner,
  Show,
  useBreakpointValue,
} from '@chakra-ui/react';
import { toaster } from '~/components/ui/toaster';
import { useNavigation } from '@remix-run/react';

import DnsRecordDeleteAlertDialog from './dns-record-delete-alert-dialog';
import DnsRecordsTableRow from './dns-record-table-row';

import type { DnsRecord } from '@prisma/client';

interface DnsRecordsTableProps {
  dnsRecords: DnsRecord[];
}

export default function DnsRecordsTable({ dnsRecords }: DnsRecordsTableProps) {
  const navigation = useNavigation();
  const {
    open: isDeleteAlertDialogOpen,
    onOpen: onDeleteAlertDialogOpen,
    onClose: onDeleteAlertDialogClose,
  } = useDisclosure();
  const [dnsRecordToDelete, setDnsRecordToDelete] = useState<DnsRecord | undefined>();

  const isBelowSm = useBreakpointValue({ base: true, sm: false });

  function onCopied() {
    toaster.create({
      title: 'DNS Record was copied to clipboard',
      // Todo!
      // status: 'success',
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
      <Card.Root p="2" mt="4">
        <Table.Root colorScheme="gray">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader paddingInline={{ base: '2', xs: '4', sm: '6' }}>
                DNS Record
              </Table.ColumnHeader>
              <Show when={!isBelowSm}>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Value</Table.ColumnHeader>
                <Table.ColumnHeader>Expiration date</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Show>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {dnsRecords.map((dnsRecord) => {
              const isLoading =
                navigation.state === 'submitting' &&
                Number(navigation.formData?.get('id')) === dnsRecord.id;

              return isLoading ? (
                <Table.Row key={dnsRecord.id}>
                  <Table.Cell py="8" colSpan={7}>
                    <Flex justifyContent="center">
                      <Spinner />
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : (
                <DnsRecordsTableRow
                  key={dnsRecord.id}
                  dnsRecord={dnsRecord}
                  onDelete={onDeleteDnsRecordOpen}
                  onCopied={onCopied}
                />
              );
            })}
          </Table.Body>
        </Table.Root>
      </Card.Root>
      <DnsRecordDeleteAlertDialog
        isOpen={isDeleteAlertDialogOpen}
        onCancel={onDnsRecordDeleteCancel}
        onConfirm={onDnsRecordDeleteConfirm}
        dnsRecord={dnsRecordToDelete}
      />
    </>
  );
}

import { useRef } from 'react';
import { Dialog, Button } from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import type { DnsRecord } from '@prisma/client';

interface DnsRecordDeleteAlertDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  dnsRecord: DnsRecord | undefined;
}

export default function DnsRecordDeleteAlertDialog({
  isOpen,
  onCancel,
  onConfirm,
  dnsRecord,
}: DnsRecordDeleteAlertDialogProps) {
  const cancelRef = useRef(null);

  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      onExitComplete={onCancel}
      initialFocusEl={() => cancelRef.current}
    >
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header fontSize="lg" fontWeight="bold">
            Delete DNS Record
          </Dialog.Header>
          <Dialog.Body>Are you sure? You can't undo this action afterwards.</Dialog.Body>
          <Dialog.Footer>
            <Button colorScheme="gray" onClick={onCancel} ref={cancelRef}>
              Cancel
            </Button>
            <Form method="delete" style={{ margin: 0 }}>
              <input type="hidden" name="id" value={dnsRecord?.id} />
              <input type="hidden" name="intent" value="delete-dns-record" />
              <Button colorScheme="brand" onClick={onConfirm} ml="3" type="submit">
                Delete
              </Button>
            </Form>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

import { useRef } from 'react';
import {
  AlertDialog,
  Button,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBody,
} from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import type { Record } from '@prisma/client';

interface RecordDeleteAlertDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  dnsRecord: Record | undefined;
}

export default function RecordDeleteAlertDialog({
  isOpen,
  onCancel,
  onConfirm,
  dnsRecord,
}: RecordDeleteAlertDialogProps) {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isCentered isOpen={isOpen} onClose={onCancel} leastDestructiveRef={cancelRef}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Domain
          </AlertDialogHeader>
          <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>
          <AlertDialogFooter>
            <Button colorScheme="gray" onClick={onCancel} ref={cancelRef}>
              Cancel
            </Button>
            <Form method="delete" style={{ margin: 0 }}>
              <input type="hidden" name="id" value={dnsRecord?.id} />
              <input type="hidden" name="intent" value="delete-record" />
              <Button colorScheme="brand" onClick={onConfirm} ml="3" type="submit">
                Delete
              </Button>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

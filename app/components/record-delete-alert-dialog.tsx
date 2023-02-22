import {
  AlertDialog,
  Button,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBody,
} from '@chakra-ui/react';
import React from 'react';

interface RecordDeleteAlertDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RecordDeleteAlertDialog(props: RecordDeleteAlertDialogProps) {
  const { isOpen, onCancel, onConfirm } = props;
  const cancelRef = React.useRef(null);

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
            <Button colorScheme="brand" onClick={onConfirm} ml="3">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

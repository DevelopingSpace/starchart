import { FormControl, FormLabel, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  children: React.ReactNode;
}

export default function FormField({ label, isRequired, children }: FormFieldProps) {
  return (
    <FormControl isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <HStack w="full">{children}</HStack>
    </FormControl>
  );
}

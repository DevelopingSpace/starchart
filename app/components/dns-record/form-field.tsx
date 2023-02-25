import { FormControl, FormErrorMessage, FormLabel, HStack } from '@chakra-ui/react';

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, isRequired, error, children }: FormFieldProps) {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <HStack w="full">{children}</HStack>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

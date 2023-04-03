import { FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack } from '@chakra-ui/react';

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  isRequired,
  error,
  helpText,
  children,
}: FormFieldProps) {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <HStack w="full">{children}</HStack>
      {helpText && <FormHelperText fontSize="xs">{helpText}</FormHelperText>}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

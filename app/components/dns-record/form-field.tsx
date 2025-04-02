import { HStack, Field } from '@chakra-ui/react';

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
    <Field.Root required={isRequired} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <HStack w="full">{children}</HStack>
      {helpText && <Field.HelperText fontSize="xs">{helpText}</Field.HelperText>}
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

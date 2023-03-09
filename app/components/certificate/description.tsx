import { Flex, Heading, Text, HStack, VStack } from '@chakra-ui/react';

interface DescriptionSectionProps {
  certRequested: boolean;
  validFromFormatted?: string;
  validToFormatted?: string;
  description: string;
}

export default function DescriptionSection({
  certRequested,
  validFromFormatted,
  validToFormatted,
  description,
}: DescriptionSectionProps) {
  return (
    <Flex
      flexDirection="column"
      gap="3"
      marginTop="5"
      fontSize={{ base: 'sm', md: 'md' }}
      alignItems={{ base: 'center', md: 'flex-start' }}
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>
        Certificate
      </Heading>
      <Text>{description}</Text>
      {certRequested && (
        <HStack gap="6" marginTop="2">
          {!!validFromFormatted && !!validToFormatted && (
            <>
              <VStack>
                <Text fontWeight="bold">Created On</Text>
                <Text>{validFromFormatted}</Text>
              </VStack>
              <VStack>
                <Text fontWeight="bold">Expires On</Text>
                <Text>{validToFormatted}</Text>
              </VStack>
            </>
          )}
        </HStack>
      )}
    </Flex>
  );
}

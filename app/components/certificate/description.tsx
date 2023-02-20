import { Flex, Heading, Text, HStack, VStack } from '@chakra-ui/react';

interface DescriptionSectionProps {
  certRequested: boolean;
  validFrom: Date;
  validTo: Date;
  description: string;
}

export default function DescriptionSection({
  certRequested,
  validFrom,
  validTo,
  description,
}: DescriptionSectionProps) {
  return (
    <Flex flexDirection="column" gap="3" marginTop="14">
      <Heading as="h1" size="xl">
        Certificate
      </Heading>
      <Text>{description}</Text>
      {certRequested && (
        <HStack gap="6" marginTop="2">
          <VStack>
            <Text fontWeight="bold">Created On</Text>
            <Text>{validFrom.toDateString()}</Text>
          </VStack>
          <VStack>
            <Text fontWeight="bold">Expires On</Text>
            <Text>{validTo.toDateString()}</Text>
          </VStack>
        </HStack>
      )}
    </Flex>
  );
}

import { RepeatIcon } from '@chakra-ui/icons';
import { Form } from '@remix-run/react';
import { Flex, Text, HStack, Button, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

interface DescriptionSectionProps {
  certRequested: boolean;
  validFromFormatted?: string;
  validToFormatted?: string;
  description: string;
  isRenewable?: boolean;
}

export default function DescriptionSection({
  certRequested,
  validFromFormatted,
  validToFormatted,
  description,
  isRenewable,
}: DescriptionSectionProps) {
  return (
    <Flex flexDirection="column" gap="3" marginTop={{ base: 1, md: 5 }} fontSize="md">
      <Text maxW={600}>{description}</Text>
      {certRequested && (
        <HStack gap="6" marginTop="2">
          {!!validFromFormatted && !!validToFormatted && (
            <>
              <Stat backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
                <StatLabel>Created On</StatLabel>
                <StatNumber>{validFromFormatted}</StatNumber>
              </Stat>
              <Stat backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
                <StatLabel>Expires On</StatLabel>
                <StatNumber>{validToFormatted}</StatNumber>
              </Stat>

              <Flex justifyContent="flex-end">
                <Form method="post">
                  <Button type="submit" rightIcon={<RepeatIcon />} isDisabled={!isRenewable}>
                    Renew Certificate
                  </Button>
                </Form>
              </Flex>
            </>
          )}
        </HStack>
      )}
    </Flex>
  );
}

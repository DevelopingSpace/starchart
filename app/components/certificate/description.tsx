import { RepeatIcon } from '@chakra-ui/icons';
import { Form } from '@remix-run/react';
import { Flex, Text, Button, Stat, StatLabel, StatNumber, Wrap, WrapItem } from '@chakra-ui/react';

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
      {certRequested && !!validFromFormatted && !!validToFormatted && (
        <Wrap align="center">
          <Stat backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
            <StatLabel>Created On</StatLabel>
            <StatNumber>{validFromFormatted}</StatNumber>
          </Stat>
          <Stat backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
            <StatLabel>Expires On</StatLabel>
            <StatNumber>{validToFormatted}</StatNumber>
          </Stat>
          <WrapItem>
            <Flex justifyContent="flex-end">
              <Form method="post">
                <Button type="submit" rightIcon={<RepeatIcon />} isDisabled={!isRenewable}>
                  Renew Certificate
                </Button>
              </Form>
            </Flex>
          </WrapItem>
        </Wrap>
      )}
    </Flex>
  );
}

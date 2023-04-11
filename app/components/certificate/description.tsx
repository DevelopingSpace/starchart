import { RepeatIcon } from '@chakra-ui/icons';
import { Form, Link as RemixLink } from '@remix-run/react';
import {
  Flex,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  Wrap,
  WrapItem,
  Link,
} from '@chakra-ui/react';

interface DescriptionSectionProps {
  certRequested: boolean;
  validFromFormatted?: string;
  validToFormatted?: string;
  description: string;
  isRenewable?: boolean;
  link?: string;
}

export default function DescriptionSection({
  certRequested,
  validFromFormatted,
  validToFormatted,
  description,
  isRenewable,
  link,
}: DescriptionSectionProps) {
  return (
    <Flex flexDirection="column" gap="3" fontSize="md">
      <Text maxW={600}>
        {description}
        {link && (
          <>
            &nbsp;To learn more, refer to our&nbsp;
            <Link as={RemixLink} to={link}>
              information page
            </Link>
            .
          </>
        )}
      </Text>
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

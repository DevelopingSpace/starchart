import { RepeatIcon, DeleteIcon } from '@chakra-ui/icons';
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
  useToast,
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
  const toast = useToast();
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
                  Renew
                </Button>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="delete-certificate" />
                <Button
                  type="submit"
                  ml={1.5}
                  rightIcon={<DeleteIcon />}
                  variant="ghost"
                  onClick={() =>
                    toast({
                      title: 'Certificate has been successfully delete',
                      position: 'bottom-right',
                      status: 'success',
                    })
                  }
                >
                  Delete
                </Button>
              </Form>
            </Flex>
          </WrapItem>
        </Wrap>
      )}
    </Flex>
  );
}

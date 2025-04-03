import { FaRepeat, FaRegTrashCan } from 'react-icons/fa6';
import { Form, Link as RemixLink } from '@remix-run/react';
import { Flex, Text, Button, Stat, Wrap, WrapItem, Link } from '@chakra-ui/react';
import { toaster } from '~/components/ui/toaster';

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
            <Link asChild>
              <RemixLink to={link}>information page</RemixLink>
            </Link>
            .
          </>
        )}
      </Text>
      {certRequested && !!validFromFormatted && !!validToFormatted && (
        <Wrap align="center">
          <Stat.Root backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
            <Stat.Label>Created On</Stat.Label>
            <Stat.ValueText>{validFromFormatted}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root backgroundColor="whitesmoke" maxW={200} px={5} py={3} borderRadius={8}>
            <Stat.Label>Expires On</Stat.Label>
            <Stat.ValueText>{validToFormatted}</Stat.ValueText>
          </Stat.Root>
          <WrapItem>
            <Flex justifyContent="flex-end">
              <Form method="post">
                <Button type="submit" disabled={!isRenewable}>
                  Renew <FaRepeat />
                </Button>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="delete-certificate" />
                <Button
                  type="submit"
                  ml={1.5}
                  variant="ghost"
                  onClick={() =>
                    toaster.create({
                      title: 'Certificate has been successfully delete',
                      // Todo!
                      // status: 'success',
                    })
                  }
                >
                  Delete <FaRegTrashCan />
                </Button>
              </Form>
            </Flex>
          </WrapItem>
        </Wrap>
      )}
    </Flex>
  );
}

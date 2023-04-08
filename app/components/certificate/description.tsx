import { RepeatIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text, HStack, VStack, IconButton } from '@chakra-ui/react';
import { Form } from '@remix-run/react';

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
    <Flex
      flexDirection="column"
      gap="3"
      marginTop="5"
      fontSize={{ base: 'sm', md: 'md' }}
      alignItems={{ base: 'center', md: 'flex-start' }}
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Flex width="100%">
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>
          Certificate
        </Heading>
      </Flex>

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

              <Flex justifyContent="flex-end">
                <Form method="post">
                  <IconButton
                    type="submit"
                    aria-label="renew-certificate"
                    icon={<RepeatIcon />}
                    backgroundColor="transparent"
                    color="black"
                    _hover={{ backgroundColor: 'brand.500', color: 'white' }}
                    isDisabled={!isRenewable}
                  />
                </Form>
              </Flex>
            </>
          )}
        </HStack>
      )}
    </Flex>
  );
}

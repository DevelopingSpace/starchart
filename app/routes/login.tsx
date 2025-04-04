import {
  Heading,
  Text,
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  VStack,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa6';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

import { getUsername } from '~/session.server';
import { createLoginRequest } from '~/lib/saml.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  // Check if a session with a username exists
  const user = await getUsername(request);

  // If not then create a login request to the IDP's redirect binding
  if (!user) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo') ?? undefined;
    const samlRedirectURL = createLoginRequest(redirectTo);
    return redirect(samlRedirectURL);
  }

  return redirect('/');
};

export default function Login() {
  return (
    <Container height="full">
      <Center height="full">
        <Grid gap="12">
          <GridItem>
            <VStack spacing="10">
              <Heading size="2xl" color="brand.500">
                My.Custom.Domain
              </Heading>
              <Text fontSize={{ base: '2xl', lg: '3xl' }} color="gray.600" align="center">
                Simple, Secure, DNS for Seneca
              </Text>
            </VStack>
          </GridItem>
          <GridItem border="solid" borderRadius="2xl" borderColor="brand.500">
            <VStack height="2xs">
              <Flex width="100px" height="100px" marginTop="10">
                <Icon color="gray.600" boxSize="100%">
                  <FaLock />
                </Icon>
              </Flex>
              <Flex flex={1} alignItems="center" justifyContent="center">
                <Form method="post">
                  <Button type="submit" width={{ base: '250px', md: '300px' }}>
                    Sign In
                  </Button>
                </Form>
              </Flex>
            </VStack>
          </GridItem>
        </Grid>
      </Center>
    </Container>
  );
}

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
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

import { getUsername } from '~/session.server';
import { createLoginRequest } from '~/saml.server';

export const action = async ({ request }: ActionArgs) => {
  //Check if a session with a username exists
  const user = await getUsername(request);

  //If not then create a login request to the IDP's redirect binding
  if (!user) {
    const context = await createLoginRequest();
    return redirect(context);
  }
  if (user) {
    return redirect('/');
  }
};

export default function Login() {
  return (
    <Container>
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
                <LockIcon color="gray.600" boxSize="100%" />
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

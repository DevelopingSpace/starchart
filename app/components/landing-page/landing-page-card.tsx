import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from '@remix-run/react';

interface LandingPageCardProps {
  path: string;
  pathName: string;
  cardName: string;
  cardDescription: string;
}

export default function LandingPageCard({
  path,
  pathName,
  cardName,
  cardDescription,
}: LandingPageCardProps) {
  return (
    <VStack
      height={{ base: 'xs', md: 'sm' }}
      borderRadius="xl"
      padding="5"
      backgroundColor="whitesmoke"
    >
      <Heading size={{ base: 'md', md: 'lg' }} color="brand.500" height="100%">
        {cardName}
      </Heading>

      <Flex width={{ md: 'xs' }} height={{ sm: 'xl' }} flexDirection="column">
        <Text fontSize={{ base: 'xs', md: 'md' }}>
          {cardDescription}
          <br />
          <Text as={Link} to={`${path}/instructions`} color="brand.500" textDecor="underline">
            To learn more, see these instructions...
          </Text>
        </Text>
      </Flex>

      <Flex width="100%" justifyContent="center" height="100%" alignItems="flex-end">
        <Button as={Link} to={{ pathname: path }} size={{ base: 'xs', xs: 'sm', md: 'md' }}>
          {pathName}
        </Button>
      </Flex>
    </VStack>
  );
}

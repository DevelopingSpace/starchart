import { Button, ButtonGroup, Flex, Heading, Text, VStack } from '@chakra-ui/react';
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
      gap="5"
      backgroundColor="whitesmoke"
    >
      <Heading size="lg" color="brand.500">
        {cardName}
      </Heading>

      <Flex width={{ md: 'xs' }} height={{ md: 'xl' }}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>{cardDescription}</Text>
      </Flex>
      <ButtonGroup size={{ base: 'sm', md: 'md' }} gap="5">
        <Button as={Link} to={{ pathname: `${path}/instructions` }}>
          Information
        </Button>
        <Button as={Link} to={{ pathname: path }}>
          {pathName}
        </Button>
      </ButtonGroup>
    </VStack>
  );
}

import {
  Text,
  Heading,
  Avatar,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { TriangleUpIcon, LockIcon } from '@chakra-ui/icons';
import { Link, useFetcher } from '@remix-run/react';

import { useUser } from '~/utils';

export default function Header() {
  const user = useUser();
  const fetcher = useFetcher();
  return (
    <Flex
      as="header"
      backgroundColor="brand.500"
      height="auto"
      alignItems="center"
      shadow="2xl"
      fontSize="18"
      paddingY="2"
    >
      <HStack width="50%" color="white" justifyContent="flex-start" gap="10" marginLeft="10">
        <Link to={{ pathname: '/domains' }}>
          <Flex alignItems="center">
            <TriangleUpIcon marginRight="2" />
            <Text>Domains</Text>
          </Flex>
        </Link>

        <Link to={{ pathname: '/certificate' }}>
          <Flex alignItems="center">
            <LockIcon marginRight="2" />
            <Text>Certificate</Text>
          </Flex>
        </Link>
      </HStack>
      <Heading as="h1" size="xl" color="white">
        My.Custom.Domain
      </Heading>
      <Flex
        width="50%"
        justifyContent="flex-end"
        alignItems="center"
        color="white"
        gap="5"
        marginRight="10"
      >
        <Text>{user.username}</Text>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Avatar size="sm" />}
            style={{ backgroundColor: 'transparent' }}
          />
          <MenuList color="black">
            <MenuItem onClick={() => fetcher.submit({}, { method: 'post', action: '/logout' })}>
              <Text fontSize="sm" color="brand.500">
                Sign Out
              </Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}

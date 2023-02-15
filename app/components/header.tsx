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
  Show,
  Hide,
  Button,
} from '@chakra-ui/react';
import { TriangleUpIcon, LockIcon, HamburgerIcon } from '@chakra-ui/icons';
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
      width="100%"
      alignItems="center"
      shadow="2xl"
      fontSize="18"
      paddingY="2"
      paddingX={{ base: '1', md: '10' }}
      justifyContent="space-between"
    >
      <Hide below="md">
        <HStack color="white" justifyContent="flex-start">
          <Link to={{ pathname: '/domains' }}>
            <Flex alignItems="center">
              <TriangleUpIcon marginRight="2" />
              <Text>Domains</Text>
            </Flex>
          </Link>

          <Link to={{ pathname: '/certificate' }}>
            <Flex alignItems="center" marginLeft="5">
              <LockIcon marginRight="2" />
              <Text>Certificate</Text>
            </Flex>
          </Link>
        </HStack>
      </Hide>
      <Show below="md">
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<HamburgerIcon />}
            size="auto"
            style={{ backgroundColor: 'transparent' }}
          />
          <MenuList>
            <MenuItem>
              <Link to={{ pathname: '/domains' }}>
                <Flex alignItems="center">
                  <TriangleUpIcon marginRight="2" />
                  <Text>Domains</Text>
                </Flex>
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to={{ pathname: '/certificate' }}>
                <Flex alignItems="center">
                  <LockIcon marginRight="2" />
                  <Text>Certificate</Text>
                </Flex>
              </Link>
            </MenuItem>
          </MenuList>
        </Menu>
      </Show>

      <Heading as="h1" size={{ base: 'md', sm: 'xl' }} color="white">
        My.Custom.Domain
      </Heading>
      <Flex justifyContent="flex-end" alignItems="center" color="white" gap="5">
        <Hide below="md">
          <Text>{user.username}</Text>
        </Hide>

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

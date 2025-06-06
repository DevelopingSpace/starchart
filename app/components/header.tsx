import {
  Heading,
  Text,
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
import { Form, Link, useFetcher } from '@remix-run/react';

import { useEffectiveUser, useUser } from '~/utils';
import { FaTheaterMasks } from 'react-icons/fa';

export default function Header() {
  // Fetch both effective and original to compare and
  // display additional conditional text in the header
  const user = useEffectiveUser();
  const originalUser = useUser();

  const fetcher = useFetcher();
  return (
    <Flex
      as="header"
      backgroundColor="brand.500"
      width="100%"
      alignItems="center"
      shadow="2xl"
      fontSize="18"
      paddingY="2"
      paddingX={{ base: '1', md: '5' }}
      justifyContent="space-between"
    >
      <Hide below="lg">
        <HStack color="white" justifyContent="flex-start" gap="10" width="100%">
          <Flex gap="5">
            <Link to={{ pathname: '/dns-records' }}>
              <Flex alignItems="center">
                <TriangleUpIcon marginRight="2" />
                <Text>DNS Records</Text>
              </Flex>
            </Link>

            <Link to={{ pathname: '/certificate' }}>
              <Flex alignItems="center" marginLeft="5">
                <LockIcon marginRight="2" />
                <Text>Certificate</Text>
              </Flex>
            </Link>
          </Flex>
        </HStack>
      </Hide>
      <Show below="lg">
        <Flex width="100%">
          <Menu>
            <MenuButton
              className="header-hamburger"
              aria-label="Account Menu"
              as={Button}
              rightIcon={<HamburgerIcon />}
              size="auto"
              style={{ backgroundColor: 'transparent' }}
            />
            <MenuList>
              <MenuItem>
                <Link to={{ pathname: '/dns-records' }}>
                  <Flex alignItems="center">
                    <TriangleUpIcon marginRight="2" />
                    <Text>DNS Records</Text>
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
        </Flex>
      </Show>
      <Show below="lg"></Show>

      <Link to={{ pathname: '/' }}>
        <Heading as="h1" size={{ base: 'md', xs: 'lg', sm: 'xl' }} color="white">
          My.Custom.Domain
        </Heading>
      </Link>

      <Flex justifyContent="flex-end" alignItems="center" color="white" width="100%">
        <Menu>
          <MenuButton
            aria-label="Open menu"
            as={IconButton}
            icon={
              <HStack gap="5">
                <Hide below="lg">
                  <Text id="header-user">
                    {user.username === originalUser.username
                      ? user?.username
                      : `Impersonating: ${user?.username}`}
                  </Text>
                </Hide>
                {user.username !== originalUser.username ? (
                  <FaTheaterMasks size="35" />
                ) : (
                  <Avatar bg="brand.500" showBorder={true} borderColor="white" size="sm" />
                )}
              </HStack>
            }
            style={{ backgroundColor: 'transparent' }}
          />
          <MenuList color="black">
            {user.username !== originalUser.username && (
              <Form action="/" method="post">
                <input type="hidden" name="intent" value="stop-impersonation" />
                <MenuItem type="submit" aria-label="Revert to original user">
                  <Text fontSize="sm" color="brand.500">
                    Stop Impersonating
                  </Text>
                </MenuItem>
              </Form>
            )}
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

import {
  Heading,
  Text,
  Avatar,
  Flex,
  HStack,
  Menu,
  IconButton,
  Button,
  Portal,
  useBreakpointValue,
  Show,
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

  const isBelowLg = useBreakpointValue({ base: true, lg: false });

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
      <Show when={!isBelowLg}>
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
      </Show>
      <Show when={isBelowLg}>
        <Flex width="100%">
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                className="header-hamburger"
                aria-label="Account Menu"
                style={{ backgroundColor: 'transparent' }}
              >
                <HamburgerIcon />
              </Button>
            </Menu.Trigger>

            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="dns-records">
                    <Link to={{ pathname: '/dns-records' }}>
                      <Flex alignItems="center">
                        <TriangleUpIcon marginRight="2" />
                        <Text>DNS Records</Text>
                      </Flex>
                    </Link>
                  </Menu.Item>
                  <Menu.Item value={'certificate'}>
                    <Link to={{ pathname: '/certificate' }}>
                      <Flex alignItems="center">
                        <LockIcon marginRight="2" />
                        <Text>Certificate</Text>
                      </Flex>
                    </Link>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Show>

      <Link to={{ pathname: '/' }}>
        <Heading as="h1" size={{ base: 'md', xs: 'lg', sm: 'xl' }} color="white">
          My.Custom.Domain
        </Heading>
      </Link>

      <Flex justifyContent="flex-end" alignItems="center" color="white" width="100%">
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              aria-label="Open menu"
              as={IconButton}
              style={{ backgroundColor: 'transparent' }}
            >
              <HStack gap="5">
                <Show when={!isBelowLg}>
                  <Text id="header-user">
                    {user.username === originalUser.username
                      ? user?.username
                      : `Impersonating: ${user?.username}`}
                  </Text>
                </Show>
                {user.username !== originalUser.username ? (
                  <FaTheaterMasks size="35" />
                ) : (
                  <Avatar.Root borderless={false} size="sm">
                    <Avatar.Image bg="brand.500" borderColor="white" />
                  </Avatar.Root>
                )}
              </HStack>
            </Button>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {user.username !== originalUser.username && (
                  <Form action="/" method="post">
                    <input type="hidden" name="intent" value="stop-impersonation" />
                    <Menu.Item
                      asChild
                      aria-label="Revert to original user"
                      value="revert-to-original-user"
                    >
                      <Button type="submit">
                        <Text fontSize="sm" color="brand.500">
                          Stop Impersonating
                        </Text>
                      </Button>
                    </Menu.Item>
                  </Form>
                )}
                <Menu.Item
                  value="sign-out"
                  onClick={() => fetcher.submit({}, { method: 'post', action: '/logout' })}
                >
                  <Text fontSize="sm" color="brand.500">
                    Sign Out
                  </Text>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}

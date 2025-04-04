import {
  Table,
  Text,
  IconButton,
  Flex,
  HStack,
  Link,
  ButtonGroup,
  useClipboard,
  VStack,
  Show,
  useBreakpointValue,
  Icon,
} from '@chakra-ui/react';
import { FaPenToSquare, FaRegTrashCan, FaRepeat, FaCopy } from 'react-icons/fa6';
import { IoIosInformationCircleOutline } from 'react-icons/io';

import { Tooltip } from '~/components/ui/tooltip';
import { Toaster, toaster } from '~/components/ui/toaster';

import { Form, useNavigate } from '@remix-run/react';
import DnsRecordName from './dns-record/dns-record-name';
import { useEffectiveUser } from '~/utils';

import type { DnsRecord } from '@prisma/client';

interface DnsRecordsTableRowProps {
  dnsRecord: DnsRecord;
  onDelete: (dnsRecord: DnsRecord) => void;
  onCopied: () => void;
}

export default function DnsRecordsTableRow({
  dnsRecord,
  onDelete,
  onCopied,
}: DnsRecordsTableRowProps) {
  const { baseDomain } = useEffectiveUser();
  const clipboard = useClipboard({ value: `${dnsRecord.subdomain}.${baseDomain}` });
  const navigate = useNavigate();

  const handleOnCopy = () => {
    clipboard.copy();
    onCopied();
  };

  const isBelowSm = useBreakpointValue({ base: true, sm: false });

  return (
    <>
      <Toaster />
      <Table.Row>
        <Table.Cell paddingInline={{ base: '2', xs: '4', sm: '6' }}>
          <Flex
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            flexDirection={{ base: 'column', sm: 'row' }}
          >
            <DnsRecordName dnsRecord={dnsRecord} baseDomain={baseDomain} />
            <Show when={isBelowSm}>
              <Text mt="2" fontSize={{ base: 'sm', xs: 'md' }}>
                <Text as="span" fontWeight="medium">
                  Type:
                </Text>{' '}
                {dnsRecord.type}
              </Text>
              <Tooltip content={dnsRecord.value}>
                <Text fontSize={{ base: 'sm', xs: 'md' }}>
                  <Text as="span" fontWeight="medium">
                    Value:
                  </Text>{' '}
                  <Text as="span" truncate maxWidth="20ch">
                    {dnsRecord.value}
                  </Text>
                </Text>
              </Tooltip>
              <Text mb="1.5" fontSize={{ base: 'sm', xs: 'md' }}>
                <Text as="span" fontWeight="medium">
                  Expiration Date:
                </Text>{' '}
                {dnsRecord.expiresAt.toLocaleDateString('en-US')}
              </Text>
            </Show>
            <ButtonGroup spacing={{ base: 'auto', sm: '0.5' }} width={{ base: 'full', sm: 'auto' }}>
              <Link
                href={`https://www.nslookup.io/domains/${dnsRecord.subdomain}.${baseDomain}/dns-propagation/${dnsRecord.type}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip content="Lookup DNS record">
                  <IconButton
                    aria-label="Lookup DNS record"
                    variant="ghost"
                    ml={{ xs: '0', sm: '2' }}
                  >
                    <Icon color="black" boxSize="5">
                      <IoIosInformationCircleOutline />
                    </Icon>
                  </IconButton>
                </Tooltip>
              </Link>
              <Tooltip content="Copy DNS record to clipboard">
                <IconButton aria-label="Refresh DNS record" variant="ghost" onClick={handleOnCopy}>
                  <Icon color="black" boxSize="5">
                    <FaCopy />
                  </Icon>
                </IconButton>
              </Tooltip>
              <Show when={isBelowSm}>
                <Form method="patch">
                  <input type="hidden" name="id" value={dnsRecord.id} />
                  <input type="hidden" name="intent" value="renew-dns-record" />
                  <Tooltip content="Renew DNS record">
                    <IconButton
                      aria-label="Refresh DNS record"
                      variant="ghost"
                      type="submit"
                      onClick={() =>
                        toaster.create({
                          title: `DNS Record "${dnsRecord.subdomain}" has been successfully renewed`,
                          type: 'success',
                        })
                      }
                    >
                      <Icon color="black" boxSize="5">
                        <FaRepeat />
                      </Icon>
                    </IconButton>
                  </Tooltip>
                </Form>
                <Tooltip content="Edit DNS record">
                  <IconButton
                    onClick={() => navigate(dnsRecord.id.toString())}
                    aria-label="Edit DNS record"
                    variant="ghost"
                  >
                    <Icon color="black" boxSize={5}>
                      <FaPenToSquare />
                    </Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip content="Delete DNS record">
                  <IconButton
                    onClick={() => onDelete(dnsRecord)}
                    aria-label="Delete DNS record"
                    variant="ghost"
                    type="submit"
                  >
                    <Icon color="black" boxSize={5}>
                      <FaRegTrashCan />
                    </Icon>
                  </IconButton>
                </Tooltip>
              </Show>
            </ButtonGroup>
          </Flex>
        </Table.Cell>
        <Show when={!isBelowSm}>
          <Table.Cell>{dnsRecord.type}</Table.Cell>
          <Table.Cell>
            <Tooltip content={dnsRecord.value}>
              <Text truncate maxWidth="20ch">
                {dnsRecord.value}
              </Text>
            </Tooltip>
          </Table.Cell>
          <Table.Cell>
            <Flex alignItems="center">
              <Text>{dnsRecord.expiresAt.toLocaleDateString('en-US')}</Text>
              <Form method="patch" style={{ margin: 0 }}>
                <input type="hidden" name="id" value={dnsRecord.id} />
                <input type="hidden" name="intent" value="renew-dns-record" />
                <Tooltip content="Renew DNS record">
                  <IconButton
                    aria-label="Refresh DNS record"
                    variant="ghost"
                    type="submit"
                    onClick={() =>
                      toaster.create({
                        title: `DNS Record "${dnsRecord.subdomain}" has been successfully renewed`,
                        type: 'success',
                      })
                    }
                  >
                    <Icon color="black" boxSize="5">
                      <FaRepeat />
                    </Icon>
                  </IconButton>
                </Tooltip>
              </Form>
            </Flex>
          </Table.Cell>
          <Table.Cell>
            <VStack align="flex-start">
              <HStack>
                <Tooltip content="Edit DNS record">
                  <IconButton
                    onClick={() => navigate(dnsRecord.id.toString())}
                    aria-label="Edit DNS record"
                    variant="ghost"
                    mr="1"
                  >
                    <Icon color="black" boxSize={5}>
                      <FaPenToSquare />
                    </Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip content="Delete DNS record">
                  <IconButton
                    onClick={() => onDelete(dnsRecord)}
                    aria-label="Delete DNS record"
                    variant="ghost"
                    type="submit"
                  >
                    <Icon color="black" boxSize={5}>
                      <FaRegTrashCan />
                    </Icon>
                  </IconButton>
                </Tooltip>
              </HStack>
            </VStack>
          </Table.Cell>
        </Show>
      </Table.Row>
    </>
  );
}

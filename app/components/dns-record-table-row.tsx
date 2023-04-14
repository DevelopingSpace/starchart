import {
  Tr,
  Text,
  Td,
  IconButton,
  Flex,
  Tooltip,
  HStack,
  Link,
  ButtonGroup,
  useClipboard,
  useToast,
  Hide,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, RepeatIcon, CopyIcon, InfoOutlineIcon } from '@chakra-ui/icons';

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
  const { onCopy } = useClipboard(`${dnsRecord.subdomain}.${baseDomain}`);
  const navigate = useNavigate();
  const toast = useToast();

  const handleOnCopy = () => {
    onCopy();
    onCopied();
  };

  return (
    <Tr>
      <Td>
        <Flex justifyContent="space-between" alignItems="center">
          <DnsRecordName dnsRecord={dnsRecord} baseDomain={baseDomain} />
          <ButtonGroup>
            <Link
              href={`https://www.nslookup.io/domains/${dnsRecord.subdomain}.${baseDomain}/dns-propagation/${dnsRecord.type}/`}
              isExternal
              target="_blank"
            >
              <Tooltip label="Lookup DNS record">
                <IconButton
                  icon={<InfoOutlineIcon color="black" boxSize="5" />}
                  aria-label="Lookup DNS record"
                  variant="ghost"
                  ml="2"
                />
              </Tooltip>
            </Link>
            <Tooltip label="Copy DNS record to clipboard">
              <IconButton
                icon={<CopyIcon color="black" boxSize="5" />}
                aria-label="Refresh DNS record"
                variant="ghost"
                ml="2"
                onClick={handleOnCopy}
              />
            </Tooltip>
          </ButtonGroup>
        </Flex>
      </Td>
      <Hide below="sm">
        <Td>{dnsRecord.type}</Td>
        <Td>
          <Tooltip label={dnsRecord.value}>
            <Text isTruncated maxWidth="20ch">
              {dnsRecord.value}
            </Text>
          </Tooltip>
        </Td>
        <Td>
          <Flex alignItems="center">
            {dnsRecord.expiresAt.toLocaleDateString('en-US')}
            <Form method="patch" style={{ margin: 0 }}>
              <input type="hidden" name="id" value={dnsRecord.id} />
              <input type="hidden" name="intent" value="renew-dns-record" />
              <Tooltip label="Renew DNS record">
                <IconButton
                  icon={<RepeatIcon color="black" boxSize="5" />}
                  aria-label="Refresh DNS record"
                  variant="ghost"
                  type="submit"
                  onClick={() =>
                    toast({
                      title: `DNS Record "${dnsRecord.subdomain}" has been successfully renewed`,
                      position: 'bottom-right',
                      status: 'success',
                    })
                  }
                />
              </Tooltip>
            </Form>
          </Flex>
        </Td>
      </Hide>
      <Td>
        <HStack>
          <Tooltip label="Edit DNS record">
            <IconButton
              onClick={() => navigate(dnsRecord.id.toString())}
              icon={<EditIcon color="black" boxSize={5} />}
              aria-label="Edit DNS record"
              variant="ghost"
              mr="1"
            />
          </Tooltip>
          <Tooltip label="Delete DNS record">
            <IconButton
              onClick={() => onDelete(dnsRecord)}
              icon={<DeleteIcon color="black" boxSize={5} />}
              aria-label="Delete DNS record"
              variant="ghost"
              type="submit"
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
}

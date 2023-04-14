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
  Hide,
  VStack,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CopyIcon, InfoOutlineIcon } from '@chakra-ui/icons';

import { useNavigate } from '@remix-run/react';
import DnsRecordName from './dns-record/dns-record-name';
import { useEffectiveUser } from '~/utils';

import type { DnsRecord } from '@prisma/client';
import DnsRecordExpiryDate from './dns-record/dns-record-expiry-date';

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

  const handleOnCopy = () => {
    onCopy();
    onCopied();
  };

  return (
    <Tr>
      <Td paddingInlineEnd={{ xs: '0', sm: '6' }}>
        <Flex
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          <DnsRecordName dnsRecord={dnsRecord} baseDomain={baseDomain} />
          <Hide above="sm">
            <Text fontSize="sm">Type: {dnsRecord.type}</Text>
            <Tooltip label={dnsRecord.value}>
              <Text fontSize="sm" isTruncated maxWidth="20ch">
                Value: {dnsRecord.value}
              </Text>
            </Tooltip>
          </Hide>
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
                  ml={{ xs: '0', sm: '2' }}
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
          <DnsRecordExpiryDate dnsRecord={dnsRecord} />
        </Td>
      </Hide>
      <Td paddingInline={{ xs: '2', sm: '6' }}>
        <VStack align="flex-start">
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
          <Hide above="sm">
            <Text>Expiration Date</Text>
            <DnsRecordExpiryDate dnsRecord={dnsRecord} />
          </Hide>
        </VStack>
      </Td>
    </Tr>
  );
}

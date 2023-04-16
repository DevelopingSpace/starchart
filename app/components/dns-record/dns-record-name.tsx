import { Flex, Text, Tooltip } from '@chakra-ui/react';

import type { DnsRecord } from '@prisma/client';

interface DnsRecordNameProps {
  dnsRecord: DnsRecord;
  baseDomain: string;
}

// If there is addition info in the record (optional fields), turn it
// into a string we can show when hovering. If none of these fields
// are present, don't bother (undefined)
function buildInfoTooltip(dnsRecord: DnsRecord) {
  const info = [];

  if (dnsRecord.description) {
    // Flatten the string into a single line
    info.push(dnsRecord.description.replace(/\r?\n/g, ' '));
  }
  if (dnsRecord.ports) {
    info.push(`Ports = ${dnsRecord.ports}`);
  }
  if (dnsRecord.course) {
    info.push(`Course = ${dnsRecord.course}`);
  }

  return info.length ? info.join(', ') : undefined;
}

const DnsRecordName = ({ dnsRecord, baseDomain }: DnsRecordNameProps) => {
  const tooltip = buildInfoTooltip(dnsRecord);
  const children = (
    <Flex alignItems="flex-end" flexDirection="row">
      <Text fontSize={{ base: 'md', xs: 'lg', sm: 'md' }}>
        <Text as="span" fontWeight="medium">
          {dnsRecord.subdomain}
        </Text>
        <Text as="span" color="gray.500">
          .{baseDomain}
        </Text>
      </Text>
    </Flex>
  );

  return tooltip ? <Tooltip label={tooltip}>{children}</Tooltip> : <>{children}</>;
};

export default DnsRecordName;

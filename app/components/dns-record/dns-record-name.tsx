import { Flex, Text } from '@chakra-ui/react';

interface DnsRecordNameProps {
  subdomain: string;
  baseDomain: string;
}

const DnsRecordName = ({ subdomain, baseDomain }: DnsRecordNameProps) => (
  <Flex alignItems="flex-end" flexDirection="row">
    <Text>
      <Text as="span" sx={{ fontWeight: 'medium' }}>
        {subdomain}
      </Text>
      <Text as="span" color="gray.500">
        .{baseDomain}
      </Text>
    </Text>
  </Flex>
);

export default DnsRecordName;

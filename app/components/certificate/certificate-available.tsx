import { Heading, Tabs, Text, List } from '@chakra-ui/react';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import Description from './description';
import GeneralPanel from './panels/general';
import NodePanel from './panels/node';
import AwsPanel from './panels/aws';
import NginxPanel from './panels/nginx';

import type { CertificateWithFullChain } from '~/models/certificate.server';

interface CertificateAvailableProps {
  certificate: CertificateWithFullChain;
  validFromFormatted: string;
  validToFormatted: string;
}

export default function CertificateAvailable({
  certificate,
  validFromFormatted,
  validToFormatted,
}: CertificateAvailableProps) {
  const isRenewable = useMemo((): boolean => {
    if (certificate.validTo) {
      const validTo = dayjs(certificate.validTo!);
      const thirtyDays = dayjs().add(30, 'day');
      return validTo.isBefore(thirtyDays);
    }
    return false;
  }, [certificate]);

  return (
    <>
      <Description
        description="With this certificate, you will have an HTTPS certificate for all of your projects connected to your DNS records."
        certRequested={true}
        validFromFormatted={validFromFormatted}
        validToFormatted={validToFormatted}
        isRenewable={isRenewable}
      />

      <Heading as="h2" size="lg" marginTop={4}>
        Using Your Certificate
      </Heading>
      <Text maxW={750}>
        Your <em>certificate</em> is made-up of a number of separate parts, and different services
        will require you to use them in various combinations. These parts include:
      </Text>

      <List.Root maxW={750} as="ol">
        <List.Item>
          <strong>Public Certificate</strong>: public (not secret) certificate that verifies domain
          ownership
        </List.Item>
        <List.Item>
          <strong>Private Key</strong>: private code (do not share!) used to encrypt/decrypt data
        </List.Item>
        <List.Item>
          <strong>Intermediate Certificate Chain</strong>: set of one or more certificates that link
          your certificate back to a Certificate Authority, establishing a trust relationship
        </List.Item>
        <List.Item>
          <strong>Full Chain</strong>: your Public Certificate combined with the Intermediate
          Certificate Chain
        </List.Item>
      </List.Root>

      <Text maxW={750}>
        You can select from the list of pre-defined services below to help guide you, or see a
        General view for all of the certificate's parts.
      </Text>

      <Tabs.Root maxW={750} defaultValue="general">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="node">Node.js</Tabs.Trigger>
          <Tabs.Trigger value="aws">AWS</Tabs.Trigger>
          <Tabs.Trigger value="nginx">NGINX</Tabs.Trigger>
        </Tabs.List>

        <GeneralPanel
          certificate={certificate.certificate!}
          privateKey={certificate.privateKey!}
          chain={certificate.chain!}
          fullChain={certificate.fullChain!}
        />
        <NodePanel
          certificate={certificate.certificate!}
          privateKey={certificate.privateKey!}
          chain={certificate.chain!}
        />
        <AwsPanel
          certificate={certificate.certificate!}
          privateKey={certificate.privateKey!}
          chain={certificate.chain!}
        />
        <NginxPanel privateKey={certificate.privateKey!} fullChain={certificate.fullChain!} />
      </Tabs.Root>
    </>
  );
}

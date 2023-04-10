import {
  Heading,
  Tab,
  TabList,
  Tabs,
  TabPanels,
  Text,
  OrderedList,
  ListItem,
} from '@chakra-ui/react';
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

      <OrderedList maxW={750}>
        <ListItem>
          <strong>Public Certificate</strong>: public (not secret) certificate that verifies domain
          ownership
        </ListItem>
        <ListItem>
          <strong>Private Key</strong>: private code (do not share!) used to encrypt/decrypt data
        </ListItem>
        <ListItem>
          <strong>Intermediate Certificate Chain</strong>: set of one or more certificates that link
          your certificate back to a Certificate Authority, establishing a trust relationship
        </ListItem>
        <ListItem>
          <strong>Full Chain</strong>: your Public Certificate combined with the Intermediate
          Certificate Chain
        </ListItem>
      </OrderedList>

      <Text maxW={750}>
        You can select from the list of pre-defined services below to help guide you, or see a
        General view for all of the certificate's parts.
      </Text>

      <Tabs maxW={750}>
        <TabList>
          <Tab>General</Tab>
          <Tab>Node.js</Tab>
          <Tab>AWS</Tab>
          <Tab>NGINX</Tab>
        </TabList>

        <TabPanels>
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
        </TabPanels>
      </Tabs>
    </>
  );
}

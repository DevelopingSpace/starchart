/**
 * This is a development only test page for triggering things via the UI
 */

import { Heading, Text, Button, Container, Stack, Alert, AlertIcon } from '@chakra-ui/react';
import { Form, useActionData } from '@remix-run/react';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { useUser } from '~/utils';
import logger from '~/lib/logger.server';
import { requireUser, requireUsername } from '~/session.server';
import { addNotification } from '~/queues/notifications.server';
import { addCertRequest } from '~/queues/certificate/certificate-flow.server';

import { addDnsRequest, updateDnsRequest, deleteDnsRequest } from '~/queues/dns/dns-flow.server';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get('intent');
  invariant(intent, 'Missing `intent` in posted form data');

  // If you want do do another action, set a different `intent`
  // in another form below and post.
  switch (intent) {
    case 'certificate-request':
      // Because of the foreign key constraint, it needs to be an existing user
      await addCertRequest({
        username: user.username,
        rootDomain: user.baseDomain,
      });
      return json({
        result: 'ok',
        message: 'Certificate requested',
      });
    case 'send-notification':
      await addNotification({
        emailAddress: user.email,
        subject: 'Notification Example',
        message: `Hello ${user.firstName}! Welcome to Starchart.`,
      });
      return json({
        result: 'ok',
        message: 'Notification sent, see mail at http://localhost:8025',
      });
    case 'dns-record-request':
      await addDnsRequest({
        type: 'A',
        name: `osd700-a1`,
        value: '192.168.0.1',
        username: user.username,
      });
      return json({
        result: 'ok',
        message: 'DNS record creation requested',
      });
    case 'update-dns-record-request':
      await updateDnsRequest({
        id: 71,
        type: 'A',
        name: 'osd700-a2',
        value: '192.168.0.2',
        username: user.username,
      });
      return json({
        result: 'ok',
        message: 'DNS record creation requested',
      });
    case 'delete-dns-record-request':
      await deleteDnsRequest({
        id: 71,
        type: 'A',
        name: 'osd700-a2',
        value: '192.168.0.2',
        username: user.username,
      });
      return json({
        result: 'ok',
        message: 'DNS record creation requested',
      });
    default:
      logger.warn('Unknown intent', intent);
      return json({ result: 'error', message: 'Unknown intent' });
  }
};

// User must be logged in to use this route
export const loader = async ({ request }: LoaderArgs) => requireUsername(request);

export default function Index() {
  const user = useUser();
  const data = useActionData<typeof action>();

  return (
    <Container>
      <Stack spacing={6}>
        <Heading mb={6} as="h1" size="3xl" noOfLines={1}>
          Starchart - Dev
        </Heading>

        <Text>Welcome {user.username}! NOTE: this page is only used for development testing.</Text>

        <Form method="post">
          <input type="hidden" name="intent" value="send-notification" />
          <Button type="submit">Send Notification</Button>
        </Form>

        <Form method="post">
          <input type="hidden" name="intent" value="certificate-request" />
          <Button type="submit">Request Certificate</Button>
        </Form>

        <Form method="post">
          <input type="hidden" name="intent" value="dns-record-request" />
          <Button type="submit">Add DNS Record</Button>
        </Form>

        <Form method="put">
          <input type="hidden" name="intent" value="update-dns-record-request" />
          <Button type="submit">Update DNS Record</Button>
        </Form>

        <Form method="delete">
          <input type="hidden" name="intent" value="delete-dns-record-request" />
          <Button type="submit">Delete DNS Record</Button>
        </Form>

        {data && (
          <Alert status={data.result === 'ok' ? 'success' : 'error'}>
            <AlertIcon />
            {data.message}
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

import { createTransport } from 'nodemailer';
import { secrets } from 'docker-secret';
import logger from './logger.server';

import type { SendMailOptions } from 'nodemailer';

const { NOTIFICATIONS_EMAIL_USER, NODE_ENV, MAILHOG_SMTP_PORT } = process.env;
const { NODEMAILER_CLIENT_ID, NODEMAILER_ACCESS_TOKEN } = secrets ?? {};

const initializeTransport = () => {
  if (!NOTIFICATIONS_EMAIL_USER) {
    throw new Error('Missing Nodemailer user. Skipping nodemailer configuration');
  }
  if (NODE_ENV === 'production') {
    if (!NODEMAILER_CLIENT_ID || !NODEMAILER_ACCESS_TOKEN) {
      throw new Error(
        'Missing Nodemailer environment variables or docker secrets. Skipping nodemailer configuration'
      );
    }
    return createTransport({
      service: 'Outlook365',
      auth: {
        type: 'OAuth2',
        user: NOTIFICATIONS_EMAIL_USER, // email address for notifications
        clientId: NODEMAILER_CLIENT_ID,
        accessToken: NODEMAILER_ACCESS_TOKEN,
      },
    });
  }
  return createTransport({
    port: Number(MAILHOG_SMTP_PORT || '1025'),
  });
};

const send = async (data: SendMailOptions) => {
  try {
    const transport = initializeTransport();
    logger.debug('Sending notification', data);
    return await transport.sendMail(data);
  } catch (error) {
    logger.warn('Unable to send notification', error);
  }
};

export default send;

import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import secrets from '~/lib/secrets.server';
import logger from './logger.server';

const { NOTIFICATIONS_EMAIL_USER, NODE_ENV, SMTP_PORT } = process.env;
const { NOTIFICATIONS_USERNAME, NOTIFICATIONS_PASSWORD } = secrets;

const DEFAULT_PROD_SMTP_HOST = 'smtp.office365.com';
const DEFAULT_PROD_SMTP_PORT = 587;

const DEFAULT_DEV_SMTP_HOST = '127.0.0.1';
// NOTE: mailhog uses 1025 internally, but this can conflict (e.g., Synology Drive)
// so we use 2025 as our default SMTP port for development.
const DEFAULT_DEV_SMTP_PORT = 2025;

const initializeTransport = () => {
  if (!NOTIFICATIONS_EMAIL_USER) {
    throw new Error('Missing Nodemailer user. Skipping nodemailer configuration');
  }
  if (NODE_ENV === 'production') {
    if (!NOTIFICATIONS_USERNAME || !NOTIFICATIONS_PASSWORD) {
      throw new Error(
        'Missing NOTIFICATIONS_USERNAME and/or NOTIFICATIONS_PASSWORD env variables. Skipping nodemailer configuration'
      );
    }
    return createTransport({
      host: DEFAULT_PROD_SMTP_HOST,
      port: DEFAULT_PROD_SMTP_PORT,
      auth: {
        user: NOTIFICATIONS_USERNAME,
        pass: NOTIFICATIONS_PASSWORD,
      },
      requireTLS: true,
    });
  }
  return createTransport({
    host: DEFAULT_DEV_SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : DEFAULT_DEV_SMTP_PORT,
  });
};

const sendNotification = async (emailAddress: string, subject: string, text: string) => {
  let transport: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> | null = null;

  try {
    transport = initializeTransport();
    logger.debug(`Sending notification to ${emailAddress}`);
    return await transport.sendMail({
      from: NOTIFICATIONS_EMAIL_USER,
      to: emailAddress,
      subject,
      text,
    });
  } catch (error) {
    logger.error('Unable to send notification', error);
    throw error;
  } finally {
    transport?.close();
  }
};

export default sendNotification;

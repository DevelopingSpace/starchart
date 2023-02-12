import { createTransport } from 'nodemailer';
import { secrets } from 'docker-secret';
import logger from './logger.server';
require('dotenv').config();

const { NOTIFICATIONS_EMAIL_USER, NODE_ENV, MAILHOG_SMTP_PORT } = process.env;
const { NOTIFICATIONS_USERNAME, NOTIFICATIONS_PASSWORD } = secrets ?? {};

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
      host: 'smtp.office365.com',
      port: 587,
      auth: {
        user: NOTIFICATIONS_USERNAME,
        pass: NOTIFICATIONS_PASSWORD,
      },
      requireTLS: true,
    });
  }
  return createTransport({
    port: Number(MAILHOG_SMTP_PORT || '1025'),
  });
};

const sendNotification = async (emailAddress: string, subject: string, text: string) => {
  try {
    const transport = initializeTransport();
    logger.debug(`Sending notification to ${emailAddress}`);
    await transport.sendMail({
      from: NOTIFICATIONS_EMAIL_USER,
      to: emailAddress,
      subject,
      text,
    });
  } catch (error) {
    logger.warn('Unable to send notification', error);
    return false;
  }
  return true;
};

export default sendNotification;

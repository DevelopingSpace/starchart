import { createTransport } from 'nodemailer';
import { secrets } from 'docker-secret';
import logger from './logger.server';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const { NOTIFICATIONS_EMAIL_USER, NODE_ENV, MAILHOG_SMTP_PORT } = process.env;
const { NOTIFICATIONS_USERNAME, NOTIFICATIONS_PASSWORD } = secrets ?? {};

/**
 * Initializes the nodemailer transport
 * @returns Nodemailer transport
 */
function initializeTransport() {
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
}

/**
 * sends an email notification
 * @param emailAddress - the email address to send notifications to
 * @param subject - the subject of the email
 * @param text - the body of the email
 * @returns a promise containing send message info, or undefined if the message was not sent successfully
 */
async function sendNotification(
  emailAddress: string,
  subject: string,
  text: string
): Promise<SMTPTransport.SentMessageInfo | undefined> {
  try {
    const transport = initializeTransport();
    logger.debug(`Sending notification to ${emailAddress}`);
    return await transport.sendMail({
      from: NOTIFICATIONS_EMAIL_USER,
      to: emailAddress,
      subject,
      text,
    });
  } catch (error) {
    logger.warn('Unable to send notification', error);
  }
}

export default sendNotification;

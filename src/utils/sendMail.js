// src/utils/sendMail.js
import nodemailer from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';

// Створюємо транспортер для Brevo
const transporter = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),       // напр., smtp-relay.brevo.com
  port: Number(getEnvVar('SMTP_PORT')), // напр., 587
  secure: false,                       // false для порта 587
  auth: {
    user: getEnvVar('SMTP_LOGIN'),     // твій SMTP логін
    pass: getEnvVar('SMTP_PASSWORD'),  // твій SMTP пароль
  },
});

// Функція відправки листа
export async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: getEnvVar('SMTP_FROM'), // твоя поштова адреса Brevo
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error; // можна кидати createHttpError(500) в контролері
  }
}

// Тестовий виклик (можна закоментувати після перевірки)
if (import.meta.url === `file://${process.argv[1]}`) {
  // перевірка прямо через node sendMail.js
  (async () => {
    try {
      await sendMail({
        to: 'killerbleuders@gmail.com',
        subject: 'Test Brevo',
        text: 'Привіт, це тест!',
        html: '<p>Привіт, це <b>тест</b>!</p>',
      });
    } catch (err) {
      console.error(err);
    }
  })();
}

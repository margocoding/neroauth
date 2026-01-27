import nodemailder from "nodemailer";
import config from "../../config/config.js";

class MailService {
  async sendMail(email: string, subject: string, text: string) {
    const transport = nodemailder.createTransport({
      host: config.smtp_host,
      secure: true,
      auth: {
        user: config.smtp_email,
        pass: config.smtp_password,
      },
    });

    await transport.sendMail({
      from: config.smtp_email,
      to: email,
      subject,
      text,
    });
    return { success: true };
  }
}

export default new MailService();

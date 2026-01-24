class MailService {
    async sendMail(email: string, subject: string, text: string) {
        // Should send a letter
        return {success: true};
    }
};

export default new MailService();
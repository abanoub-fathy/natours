const mailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user) {
    this.user = user;
    this.to = user.email;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return mailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return mailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(template, subject, data) {
    // render the template
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      data,
    );

    // create email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    console.log(process.env.NODE_ENV);

    // create transport and send the email
    const result = await this.newTransport().sendMail(mailOptions);
    console.log(result);
  }

  async sendWelcomeEmail(url) {
    await this.send('welcome', 'welcome in Natours App', {
      url,
      firstName: this.user.name.split(' ')[0],
    });
  }

  async sendResetPassword(url) {
    await this.send('resetPassword', 'password reset (10 mins)', {
      url,
      firstName: this.user.name.split(' ')[0],
    });
  }
};

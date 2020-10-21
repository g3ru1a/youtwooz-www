import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import dotenv from 'dotenv';

dotenv.config();

const auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    },
    host: 'api.eu.mailgun.net'
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

export default function send(email, userID, token, domain) {
    console.log(process.env.MAILGUN_API_KEY,process.env.MAILGUN_DOMAIN);
    console.log("Email sending to " + email);
    nodemailerMailgun.sendMail({
        from: 'noreply@youtwooz.com',
        to: email, // An array if you have multiple recipients.
        subject: 'Thank you for signing up on Youtwooz!',
        //You can use "html:" to send HTML email content. It's magic!
        html: `Please confirm your account by clicking the link below: <br> <a href="http://${domain}/account/verify/${userID}/${token}">http://${domain}/account/verify/${userID}/${token}</a>`,
    }, (err, info) => {
        if(err) console.log(err);
        else console.log(`Response: ${info}`);
    });
}

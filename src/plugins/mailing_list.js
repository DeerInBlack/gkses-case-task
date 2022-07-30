"use strict";

const fs = require("fs");
const nodemailer = require('nodemailer');
const { EOL } = require('os');

async function addEmail(email) {
    if (this.emails_set.has(email))
        return false;

    fs.promises.appendFile(this.filePath, email + EOL)
        .catch((err) => console.log(err));

    this.emails_set.add(email);

    return true;
};

function getEmails() {
    return this.emails_set;
};

async function sendEmailList(data) {
    const failedEmails = new Set();

    for (let email of this.emails_set) {
        transporter.sendMail({
            from: `${this.emailAccount} <${emailAccount}>`,
            to: email,
            subject: data.title,
            text: data.text,
            html: data.html,
            header: data.header
        }, (err, info) => {
            if (err !== null) {
                console.log(err);
            }
            else {
                info.rejected.forEach((rejectedMail) =>
                    failedEmails.add(rejectedMail));
            }
        });
    }

    return failedEmails;
}

module.exports.plugin = {
    name: 'mailingListPlugin',
    version: '0.8.0',
    register: async function (server, options) {
        const filePath = options.emailsPath;
        const emails = (await fs.promises.readFile(filePath, 'utf-8'))
            .split(EOL).slice(0, -1);


        // methods use emails_set as shared object 
        //  which can be changed only by them (unless you share it)
        // as long as nodejs is single thread such technic is safe and easy 
        // storing all mails in RAM helps to reduce overhead constantly writing and reading fil,
        //  but the need to store a great amount of emails can affect
        const emails_set = new Set(emails);

        server.method('addEmail', addEmail, {
            bind: { emails_set, filePath }
        });

        server.method('getEmails', getEmails, {
            bind: { emails_set, filePath }
        });


        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        transporter.verify(function (error, success) {
            if (error) {
                throw Error("Not able to connect SMTP server");
            } else {
                console.log('SMTP server connected');
            }
        });

        server.method('sendEmailList', sendEmailList, {
            bind: {
                emails_set,
                transporter,
                emailAccount: process.env.EMAIL_ACCOUNT
            }
        });
    }
};

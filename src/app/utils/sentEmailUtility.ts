// import config from "../../config";

// const nodemailer = require("nodemailer");
// const smtpTransporter = require("nodemailer-smtp-transport");

// let sentEmailUtility = async (
//   emailTo: string,
//   EmailSubject: string,
//   EmailText: string,
//   EmailHTML: string // HTML content as a parameter
// ) => {
//   let transporter = nodemailer.createTransport(
//     smtpTransporter({
//       host: "mail.hasanmajedul.com",
//       secure: true,
//       port: 465,
//       auth: {
//         user: config.emailSender.email,
//         pass: config.emailSender.app_pass,

//       },
//        tls: {
//     rejectUnauthorized: false, // OPTIONAL: Bypass SSL issues (only if necessary)
//   },
//     })
//   );

//   let mailOption = {
//     from: config.emailSender.email,
//     to: emailTo,
//     subject: EmailSubject,
//     text: EmailText,
//     html: EmailHTML,
//   };

//   return await transporter.sendMail(mailOption);
// };

import nodemailer from "nodemailer";
import config from "../../config";

const sentEmailUtility = async (
  emailTo: string,
  EmailSubject: string,
  EmailText: string,
  EmailHTML: string
) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  // Email options
  const mailOptions = {
    from: config.emailSender.email,
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
    text: EmailText,
  };
  await transporter.sendMail(mailOptions);
};

export default sentEmailUtility;

const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

// In the following function, we pass data before request and response
const sendEmail = asyncHandler(async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MP,
        }
    });

    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Hey 👻" <neupaner542@gmail.com>', // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body
            html: data.html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    } catch (error) {
        console.error("Error sending email:", error);
        // Handle the error, you can send an error response or perform other actions
    }
});

module.exports = sendEmail;

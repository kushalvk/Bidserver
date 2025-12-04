const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Transporter verification failed:", error);
    } else {
        console.log("Email Transporter is ready to send emails");
    }
});

async function sendMail(email, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"Client" <${email}>`,
            to: "hardikdev36@gmail.com",
            subject,
            text,
            html,
            headers: {
                "X-Entity-Ref-ID": `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            },
        });
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = { sendMail };

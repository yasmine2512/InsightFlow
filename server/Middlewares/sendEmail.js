import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
});

export default async function sendEmail({
    to,
    subject,
    html,
}) {
    const message = [
        `From: ${process.env.GMAIL_SENDER}`,
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        html,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
try {
    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });
    } catch (error) {
  throw new Error("Failed to send email");
}
}
import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();
const REDIRECT_URI = "http://localhost:5000/oauth2callback";
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
        "https://www.googleapis.com/auth/gmail.send",
    ],
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("\nPaste the authorization code here: ", async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log("\nAccess Token:");
        console.log(tokens.access_token);

        console.log("\nRefresh Token:");
        console.log(tokens.refresh_token);

        console.log("\nSave this in your .env:");
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        rl.close();
    } catch (err) {
        console.error("Error getting tokens:", err);
        rl.close();
    }
});
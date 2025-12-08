import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Redirect URL for testing/playground
);

// Set the refresh token (this assumes the user has already obtained one)
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
}

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function addEvent(
    summary: string,
    description: string,
    startTime: string,
    endTime: string
) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error("Missing Google Calendar credentials in environment variables.");
    }

    try {
        const event = {
            summary,
            description,
            start: {
                dateTime: startTime,
                timeZone: "UTC", // Or make this configurable
            },
            end: {
                dateTime: endTime,
                timeZone: "UTC",
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error("Error adding event to calendar:", error);
        throw error;
    }
}

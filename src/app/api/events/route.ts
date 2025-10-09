
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { getCredentials } from "@/libs/google-credentials";
// Define the shape of the incoming request data
interface EventCreate {
  summary: string;
  description?: string;
  start: string; // ISO date string, e.g., "2025-05-20T10:00:00Z"
  end: string; // ISO date string, e.g., "2025-05-20T11:00:00Z"
  attendees: string[]; // Array of email addresses
}
export async function POST(req: NextRequest) {
  try {
    const data: EventCreate = await req.json();
    // Validate input
    const { summary, description, start, end, attendees } = data;
    if (!summary || !start || !end || !attendees) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Validate email format for attendees
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validAttendees = attendees.filter(
      (email) => email && emailRegex.test(email)
    );
    if (validAttendees.length === 0) {
      return NextResponse.json(
        { error: "At least one valid attendee email is required" },
        { status: 400 }
      );
    }
    // Create event object
    const event = {
      summary,
      description: description || "",
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: "UTC",
      },
      attendees: validAttendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${uuidv4()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };
    // Get Google Calendar service
    const auth = await getCredentials(); // OAuth2Client with access & refresh token
    const calendar = google.calendar({ version: "v3", auth });
    // Insert event into Google Calendar
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      // resource: event,
      conferenceDataVersion: 1,
    });
    return NextResponse.json({ created: response.data }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const auth = await getCredentials(); // Your OAuth2 client
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.list({
      calendarId: "primary",
      maxResults: 100, // Adjust as needed
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date().toISOString(), // Optional: only future events
    });
    return NextResponse.json({ events: response.data.items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

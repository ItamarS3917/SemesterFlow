import { z } from "zod";
import { supabase } from "./supabase.js";
import { addEvent } from "./google-calendar.js";

export const TOOLS = {
    ADD_ASSIGNMENT: "add_assignment",
    ADD_TO_CALENDAR: "add_to_calendar",
};

export const ToolSchemas = {
    [TOOLS.ADD_ASSIGNMENT]: {
        name: TOOLS.ADD_ASSIGNMENT,
        description: "Create a new assignment for a course",
        inputSchema: {
            type: "object",
            properties: {
                courseId: { type: "string", description: "The UUID of the course" },
                name: { type: "string", description: "Name of the assignment" },
                dueDate: { type: "string", description: "Due date in ISO format (YYYY-MM-DD)" },
                estimatedHours: { type: "number", description: "Estimated hours to complete" },
            },
            required: ["courseId", "name"],
        },
    },
    [TOOLS.ADD_TO_CALENDAR]: {
        name: TOOLS.ADD_TO_CALENDAR,
        description: "Add an event to the user's primary Google Calendar",
        inputSchema: {
            type: "object",
            properties: {
                summary: { type: "string", description: "Title of the event" },
                description: { type: "string", description: "Description of the event" },
                startTime: { type: "string", description: "Start time in ISO format (e.g. 2023-10-27T10:00:00Z)" },
                endTime: { type: "string", description: "End time in ISO format (e.g. 2023-10-27T11:00:00Z)" },
            },
            required: ["summary", "startTime", "endTime"],
        },
    },
};

export async function handleCallTool(name: string, args: any) {
    if (name === TOOLS.ADD_ASSIGNMENT) {
        const schema = z.object({
            courseId: z.string(),
            name: z.string(),
            dueDate: z.string().optional(),
            estimatedHours: z.number().optional(),
        });

        const parsed = schema.parse(args);

        const { data, error } = await supabase
            .from("assignments")
            .insert({
                course_id: parsed.courseId,
                name: parsed.name,
                due_date: parsed.dueDate,
                estimated_hours: parsed.estimatedHours,
                status: "NOT_STARTED",
            })
            .select()
            .single();

        if (error) throw error;

        return {
            content: [{ type: "text", text: `Assignment created: ${data.name} (ID: ${data.id})` }],
        };
    }

    if (name === TOOLS.ADD_TO_CALENDAR) {
        const schema = z.object({
            summary: z.string(),
            description: z.string().optional().default(""),
            startTime: z.string(),
            endTime: z.string(),
        });

        const parsed = schema.parse(args);

        const event = await addEvent(
            parsed.summary,
            parsed.description,
            parsed.startTime,
            parsed.endTime
        );

        return {
            content: [{ type: "text", text: `Event added to calendar: ${event.summary} (Link: ${event.htmlLink})` }],
        };
    }

    throw new Error(`Tool ${name} not found`);
}

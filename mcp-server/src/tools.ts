import { z } from "zod";
import { supabase } from "./supabase.js";

export const TOOLS = {
    ADD_ASSIGNMENT: "add_assignment",
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

    throw new Error(`Tool ${name} not found`);
}

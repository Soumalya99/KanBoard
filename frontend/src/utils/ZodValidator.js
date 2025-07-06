import { z } from 'zod';

export const projectSchema = z.object({
    name:
        z.string()
        .min(1, "Project name is required")
        .max(50, "Project name must be within 50 characters"),
    key: 
        z.string()
        .min(2, "Project key must be of 2 characters")
        .max(10, "Project key must be within 10 characters"),
    description:
        z.string()
        .max(500, "Project description must be within 500 characters")
        .optional(),
});

export const sprintSchema = z.object({
    name:
        z.string()
        .min(1, "Sprint name is required"),
    startDate:
        z.date(),
    endDate:
        z.date(),
});

export const issueSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    assigneeId: z.string().cuid('Please select assignee'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
})
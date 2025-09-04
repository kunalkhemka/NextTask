import { IssuePriority } from "@/lib/generated/prisma";
import z from "zod";

export const projectSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less"),
  projectKey: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must be 10 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});
export type ProjectFormData = z.infer<typeof projectSchema>;

export const SprintSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(100, "Sprint name must be 100 characters or less"),
  startDate: z.date(),
  endDate: z.date(),
});
export type SprintFormData = z.infer<typeof SprintSchema>;

export const IssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  assigneeId: z.cuid("Please select assignee"),
  description: z.string().optional(),
  priority: z.enum(IssuePriority),
});
export type IssueFormData = z.infer<typeof IssueSchema>;

import { Issue, Prisma, Project, Sprint, User } from "@/lib/generated/prisma";

export type ProjectWithSprints = Prisma.ProjectGetPayload<{
  include: { sprints: true };
}>;

export type IssueWithAssigneeReporter = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
  };
}>;

export type SuccessResponse = {
  success: boolean;
  data?: Sprint;
};

export type ApiResponse =
  | Project
  | Sprint
  | User[]
  | Issue[]
  | IssueWithAssigneeReporter
  | IssueWithAssigneeReporter[]
  | SuccessResponse
  | null;

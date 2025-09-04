"use server";

import { IssueFormData } from "@/app/utils/validations";
import { IssueStatus } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createIssue(
  projectId: string,
  data: IssueFormData & { status: IssueStatus; sprintId: string }
) {
  console.log("====data=====", data);
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User Not found");
  }

  const lastIssue = await prisma.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newIssueOrder = lastIssue ? lastIssue.order + 1 : 0;

  const createdIssue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId, // Add this line
      order: newIssueOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return createdIssue;
}

export async function getIssuesForSprint(sprintId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await prisma.issue.findMany({
    where: { sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

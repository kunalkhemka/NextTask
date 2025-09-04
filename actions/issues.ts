"use server";

import { IssueWithAssigneeReporter } from "@/app/types";
import { IssueFormData } from "@/app/utils/validations";
import { Issue, IssueStatus } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createIssue(
  projectId: string,
  data: IssueFormData & { status: IssueStatus; sprintId: string }
) {
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

export async function updateIssueOrder(
  updatedIssues: IssueWithAssigneeReporter[]
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Start a transaction
  await prisma.$transaction(async (prisma) => {
    // Update each issue
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return { success: true };
}

export async function deleteIssue(issueId: string) {
  const { userId, orgId, has } = await auth();

  const isAdmin = has({ role: "admin" });

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.reporterId !== user.id && !isAdmin) {
    throw new Error("You don't have permission to delete this issue");
  }

  await prisma.issue.delete({ where: { id: issueId } });

  return { success: true };
}

export async function updateIssue(issueId: string, data: Issue) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error updating issue: " + error.message);
    }
    throw new Error("Error updating issues");
  }
}

export async function getUserIssues() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issues = await prisma.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

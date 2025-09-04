"use server";

import { ProjectWithSprints } from "@/app/types";
import { ProjectFormData } from "@/app/utils/validations";
import { Project } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createProject(data: ProjectFormData) {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }

  if (!orgId) {
    throw new Error("No organization selected");
  }

  const client = await clerkClient();

  const { data: membership } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membership.find(
    (m) => m.publicUserData?.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("User is not an admin of the organization");
  }

  const project = await prisma.project.create({
    data: {
      name: data.projectName,
      key: data.projectKey,
      description: data.description,
      organizationId: orgId,
    },
  });

  return project;
}

export async function deleteProject(projectId: string) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }

  if (!orgId) {
    throw new Error("No organization selected");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found!");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}

export async function fetchAllProjectsForOrganization() {
  const { userId, orgId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const projects = await prisma.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function fetchProjectById(
  projectId: string
): Promise<ProjectWithSprints | null> {
  const { userId, orgId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.organizationId !== orgId) {
    return null;
  }

  return project;
}

"use server";

import { SprintFormData } from "@/app/utils/validations";
import { SprintStatus } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId: string, data: SprintFormData) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  const sprint = await prisma.sprint.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      status: SprintStatus.PLANNED,
      projectId,
    },
  });

  return sprint;
}

export async function updateSprintStatus(
  sprintId: string,
  newStatus: SprintStatus
) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new Error("Sprint not found");
    }

    if (orgRole !== "org:admin") {
      throw new Error("Only Admin can make this change");
    }

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    if (
      newStatus === SprintStatus.ACTIVE &&
      (now < startDate || now > endDate)
    ) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === SprintStatus.COMPLETED) {
      if (sprint.status !== SprintStatus.ACTIVE) {
        throw new Error("Can only complete an active sprint");
      }
      if (now < endDate) {
        throw new Error("Cannot end sprint before its end date");
      }
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: newStatus,
      },
    });

    return { success: true, data: updatedSprint };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Error occurred while updating the sprint status");
    }
  }
}

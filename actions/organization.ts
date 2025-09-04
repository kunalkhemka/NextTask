"use server";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const getCurrentOrganization = async (slug: string) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User is not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found in the database");
    }
    const client = await clerkClient();
    const organization = await client.organizations
      .getOrganization({
        slug,
      })
      .catch(() => null);

    if (!organization) {
      return null;
    }

    const { data: membership } =
      await client.organizations.getOrganizationMembershipList({
        organizationId: organization.id,
      });

    const userMembership = membership.find(
      (m) => m.publicUserData?.userId === user.clerkUserId
    );

    if (!userMembership) {
      return null;
    }

    return organization;
  } catch (error) {
    console.error("Error in getCurrentOrganization:", error);
    return null;
  }
};

export async function getOrganizationUsers() {
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

  const client = await clerkClient();

  const { data: membership } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userIds = membership.map((m) => m.publicUserData?.userId);

  const users = await prisma.user.findMany({
    where: {
      clerkUserId: {
        in: userIds as string[],
      },
    },
  });

  return users;
}

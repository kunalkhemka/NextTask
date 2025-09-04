import { getCurrentOrganization } from "@/actions/organization";
import OrgSwitcher from "@/app/(main)/organization/_components/OrganizationSwitcher";
import ProjectsList from "@/app/(main)/organization/_components/ProjectsList";
import React from "react";

interface OrganizationParams {
  params: {
    orgId: string;
  };
}

const Organization: React.FC<OrganizationParams> = async ({ params }) => {
  const { orgId } = await params;
  const organization = await getCurrentOrganization(orgId);

  if (!organization) {
    return <div>Organization not found or you do not have access.</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-5xl font-bold gradient-title pb-2">
          {organization?.name}'s Projects
        </h1>
        <OrgSwitcher />
      </div>
      <div className="mb-4"></div>
      <ProjectsList />
      <div className="mt-8"></div>
    </div>
  );
};

export default Organization;

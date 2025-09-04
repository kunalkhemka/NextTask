"use client";

import {
  OrganizationList,
  useOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Onboarding = () => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();
  const router = useRouter();

  // useEffect(() => {
  //   if (organization) {
  //     router.push(`/organization/${organization.slug}`);
  //   }
  // }, [organization]);

  useEffect(() => {
    if (setActive) {
      setActive({ organization: null });
    }
  }, [setActive]);

  return (
    <div className="flex justify-center items-center pt-14">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl={"/organization/:slug"}
        afterSelectOrganizationUrl={"/organization/:slug"}
      />
    </div>
  );
};

export default Onboarding;

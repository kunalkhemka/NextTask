import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueWithAssigneeReporter } from "@/app/types";
import { getUserIssues } from "@/actions/issues";
import { Issue } from "@/lib/generated/prisma";
import IssueCard from "../../project/_components/IssueCard";

const UserIssues = async ({ userId }: { userId: string }) => {
  const issues = await getUserIssues();

  if (issues.length === 0 || !userId) {
    return null;
  }

  const assignedIssues = issues.filter(
    (issue) => issue?.assignee?.clerkUserId === userId
  );
  const reportedIssues = issues.filter(
    (issue) => issue.reporter.clerkUserId === userId
  );

  return (
    <>
      <h1 className="text-4xl font-bold gradient-title mb-4">My Issues</h1>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned" className="cursor-pointer">Assigned to You</TabsTrigger>
          <TabsTrigger value="reported" className="cursor-pointer">Reported by You</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={assignedIssues as IssueWithAssigneeReporter[]} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
};

const IssueGrid = ({ issues }: { issues: IssueWithAssigneeReporter[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues?.map((issue, index) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          showStatus={true}
        />
      ))}
    </div>
  );
};

export default UserIssues;

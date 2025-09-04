"use client";

import UserAvatar from "@/app/components/UserAvatar";
import { PRIORITY_COLOR } from "@/app/constants";
import { IssueWithAssigneeReporter } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/generated/prisma";
import { Draggable } from "@hello-pangea/dnd";
import { formatDistanceToNow } from "date-fns";
import React, { MouseEventHandler, useState } from "react";
import IssueDetailsDialog from "./IssueDetailsDialog";
import { useRouter } from "next/navigation";

type params = {
  issue: IssueWithAssigneeReporter;
  showStatus: boolean;
  onDelete?: () => void;
  onUpdate?: (issue: IssueWithAssigneeReporter) => void;
};

const IssueCard = ({
  issue,
  showStatus = false,
  onDelete,
  onUpdate,
}: params) => {
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });
  const router = useRouter();

  const onDeleteHandler = () => {
    router.refresh();
    onDelete && onDelete();
  };

  const onUpdateHandler = (issue: IssueWithAssigneeReporter) => {
    router.refresh();
    onUpdate && onUpdate(issue);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow pt-0"
        onClick={() => setIsIssueDialogOpen(true)}
      >
        <CardHeader
          className={`border-t-4 ${PRIORITY_COLOR[issue.priority]} rounded-lg`}
        >
          <CardTitle className="pt-6">{issue.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 -mt-3">
          {showStatus && <Badge>{issue.status}</Badge>}
          <Badge variant="outline" className="-ml-1">
            {issue.priority}
          </Badge>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-3">
          <UserAvatar user={issue.assignee as User} />

          <div className="text-xs text-gray-400 w-full">Created {created}</div>
        </CardFooter>
      </Card>

      {isIssueDialogOpen && (
        <IssueDetailsDialog
          isOpen={isIssueDialogOpen}
          onClose={setIsIssueDialogOpen}
          issue={issue}
          borderCol={PRIORITY_COLOR[issue.priority]}
          onDelete={onDeleteHandler}
          onUpdate={onUpdateHandler}
        />
      )}
    </>
  );
};

export default IssueCard;

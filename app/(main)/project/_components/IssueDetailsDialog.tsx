"use client";

import { deleteIssue, updateIssue } from "@/actions/issues";
import UserAvatar from "@/app/components/UserAvatar";
import {
  IssuePriority,
  IssuePriorityType,
  IssueStatuses,
} from "@/app/constants";
import useAdmin from "@/app/hooks/useAdmin";
import useFetch from "@/app/hooks/useFetch";
import { IssueWithAssigneeReporter } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  IssuePriority as IssuePriorityGen,
  IssueStatus,
  User,
} from "@/lib/generated/prisma";
import { useUser } from "@clerk/nextjs";
import { SelectTrigger } from "@radix-ui/react-select";
import MDEditor from "@uiw/react-md-editor";
import { ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

type params = {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  issue: IssueWithAssigneeReporter;
  onDelete: () => void;
  onUpdate: (issue: IssueWithAssigneeReporter) => void;
  borderCol: string;
};

const IssueDetailsDialog = ({
  issue,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  borderCol = "",
}: params) => {
  const [status, setStatus] = useState(issue.status);
  const [priority, setPriority] = useState(issue.priority);

  const { user } = useUser();
  const isAdmin = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const {
    isLoading: isIssueUpdating,
    error: issueUpdateError,
    fn: actionUpdateIssue,
    data: updatedIssueData,
  } = useFetch(updateIssue);

  const {
    isLoading: isIssueDeleting,
    error: issueDeleteError,
    fn: actionDeleteIssue,
    data: issueDeleteStatus,
  } = useFetch(deleteIssue);

  useEffect(() => {
    if (issueDeleteStatus) {
      onClose(false);
      onDelete();
    }
    if (updatedIssueData) {
      onUpdate(updatedIssueData as IssueWithAssigneeReporter);
    }
  }, [issueDeleteStatus, updatedIssueData, isIssueDeleting, isIssueUpdating]);

  const canUpdateIssue =
    (user && user.id === issue.reporter.clerkUserId) || isAdmin;

  const isProjectPage = !pathname.startsWith("/project/");

  const handleGoToProject = () => {
    router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as IssueStatus);
    actionUpdateIssue(issue.id, { status: newStatus, priority });
  };

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority as IssuePriorityGen);
    actionUpdateIssue(issue.id, { status, priority: newPriority });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      actionDeleteIssue(issue.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
            {isProjectPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoToProject}
                title="Go to Project"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        {(isIssueDeleting || isIssueUpdating) && <BarLoader width={"100%"} />}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 space-x-2">
            <div className="flex gap-5">
              <span>Status: </span>
              <Select
                value={status as IssueStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger
                  className={`border border-gray-300 rounded flex-1 max-w-[200px]`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IssueStatuses.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <span>Priority: </span>
              <Select
                value={priority}
                onValueChange={handlePriorityChange}
                disabled={!canUpdateIssue}
              >
                <SelectTrigger
                  className={`border ${borderCol} rounded flex-1 max-w-[200px]`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(IssuePriority).map((key) => (
                    <SelectItem key={key} value={key}>
                      {IssuePriority[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Description</h4>
            <div className="bg-white border-1 rounded-xl w-full h-[200px] py-2">
              <MDEditor.Markdown
                className="rounded px-2 py-1"
                source={issue?.description || ""}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              <UserAvatar user={issue.assignee as User} />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter as User} />
            </div>
          </div>

          {canUpdateIssue && (
            <Button
              onClick={handleDelete}
              disabled={isIssueDeleting as boolean}
              variant="destructive"
            >
              {isIssueDeleting ? "Deleting..." : "Delete Issue"}
            </Button>
          )}
          {(issueDeleteError || issueUpdateError) && (
            <p className="text-red-500">
              {issueDeleteError?.message || issueUpdateError?.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsDialog;

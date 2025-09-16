"use client";

import { updateSprintStatus } from "@/actions/sprint";
import useFetch from "@/app/hooks/useFetch";
import { SuccessResponse } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprint, SprintStatus } from "@/lib/generated/prisma";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

type params = {
  sprint: Sprint;
  setSprint: (sprint: Sprint) => void;
  sprints: Sprint[];
  projectId: string;
};

const SprintManager = ({ sprint, setSprint, sprints, projectId }: params) => {
  const [status, setStatus] = useState(sprint.status);
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const now = new Date();

  const {
    data: updatedSprintData,
    isLoading,
    fn: actionUpdateSprintStatus,
  } = useFetch(updateSprintStatus);

  const canStartSprint =
    isAfter(now, startDate) &&
    isBefore(now, endDate) &&
    status === SprintStatus.PLANNED;

  const canEndSprint = status === SprintStatus.ACTIVE;

  useEffect(() => {
    if (updatedSprintData) {
      const sprintData = updatedSprintData as SuccessResponse;
      const updatedSprint = sprintData.data as Sprint;
      if (sprintData.success) {
        setStatus(updatedSprint.status);
        setSprint({
          ...sprint,
          status: updatedSprint.status,
        });
        toast.success("Sprint status updated successfully!");
      }
    }
  }, [updatedSprintData, isLoading]);

  const handleSprintChange = (value: string) => {
    const selectedSprint = sprints.find((s) => s.id === value) as Sprint;
    setSprint(selectedSprint);
    setStatus(selectedSprint?.status);
  };

  const handleStatusChange = async (newStatus: SprintStatus) => {
    await actionUpdateSprintStatus(sprint.id, newStatus);
  };

  const getStatusText = () => {
    if (status === SprintStatus.COMPLETED) {
      return "Sprint Ended";
    }

    if (status === SprintStatus.ACTIVE && isAfter(now, endDate)) {
      return `Sprint Overdue by ${formatDistanceToNow(endDate)}`;
    }

    if (status === SprintStatus.PLANNED && isBefore(now, startDate)) {
      return `Sprint starts in ${formatDistanceToNow(startDate)}`;
    }

    return null;
  };

  return (
    <div>
      <div className="flex flex-col flex-wrap justify-center sm:flex-row sm:justify-between items-center gap-4 mt-5 sm:mt-0 sm:max-w-150 m-auto">
        <Select value={sprint.id} onValueChange={handleSprintChange}>
          <SelectTrigger
            className={`w-[250px] sm:w-[370px] data-[size=default]:h-12 sm:data-[size=default]:h-9`}
          >
            <SelectValue placeholder="Select Sprint" className="bg-white" />
          </SelectTrigger>
          <SelectContent>
            {sprints.map((sprint) => {
              return (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <span className="flex flex-col sm:flex-row cursor-pointer gap-0 sm:gap-2">
                    <span>{sprint.name}</span>
                    <span>
                      ({format(sprint.startDate, "MMM d, yyyy")} to{" "}
                      {format(sprint.endDate, "MMM d, yyyy")})
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {canStartSprint && (
          <Button
            className="bg-green-700 hover:bg-green-900 text-white cursor-pointer"
            onClick={() => {
              handleStatusChange(SprintStatus.ACTIVE);
            }}
          >
            Start Sprint
          </Button>
        )}

        {canEndSprint && (
          <Button
            variant="destructive"
            className=" cursor-pointer"
            onClick={() => {
              handleStatusChange(SprintStatus.COMPLETED);
            }}
          >
            End Sprint
          </Button>
        )}

        {!canStartSprint && !canEndSprint && getStatusText() && (
          <Badge>{getStatusText()}</Badge>
        )}

        {isLoading && <BarLoader width={"100%"} className="basis-full" />}
      </div>
    </div>
  );
};

export default SprintManager;

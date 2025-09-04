"use client";

import { ProjectWithSprints } from "@/app/types";
import { IssueStatus, SprintStatus } from "@/lib/generated/prisma";
import { useEffect, useState } from "react";
import SprintManager from "./SprintManager";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { IssueStatuses, IssueStatusesType } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateIssueDrawer from "./CreateIssueDrawer";
import useFetch from "@/app/hooks/useFetch";
import { getIssuesForSprint } from "@/actions/issues";
import { BarLoader } from "react-spinners";

const SprintBoard = ({
  project,
  orgId,
}: {
  project: ProjectWithSprints;
  orgId: string;
}) => {
  const [currentSprint, setCurrentSprint] = useState(
    project.sprints?.find((sprint) => sprint.status === SprintStatus.ACTIVE) ||
      project.sprints?.[0]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(
    null
  );

  const {
    data: issues,
    setData: setIssues,
    error: getIssuesError,
    isLoading: isIssuesLoading,
    fn: actionGetIssuesForSprint,
  } = useFetch(getIssuesForSprint);

  useEffect(() => {
    if (currentSprint.id) {
      actionGetIssuesForSprint(currentSprint.id);
    }
  }, [currentSprint.id]);

  const onDragEnd = () => {};

  const handleAddIssue = (status: IssueStatusesType) => {
    setSelectedStatus(status.key);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {};

  if (getIssuesError) {
    return <div>Error loading Issues</div>;
  }

  return (
    <div>
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={project.sprints}
        projectId={project.id}
      />

      {isIssuesLoading && (
        <BarLoader className="mt-4" width={"100%"} />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded-lg">
          {IssueStatuses.map((status) => (
            <Droppable key={status.key} droppableId={status.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {status.name}
                  </h3>

                  {/* Issues */}

                  {provided.placeholder}
                  {status.key === IssueStatus.TODO &&
                    currentSprint.status !== SprintStatus.COMPLETED && (
                      <Button
                        className="flex m-auto"
                        onClick={() => handleAddIssue(status)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <CreateIssueDrawer
        isOpen={isDrawerOpen}
        setIsDrawerOpen={(open) => setIsDrawerOpen(open)}
        onIssueCreated={handleIssueCreated}
        sprintId={currentSprint.id}
        status={selectedStatus}
        orgId={orgId}
        projectId={project.id}
      />
    </div>
  );
};

export default SprintBoard;

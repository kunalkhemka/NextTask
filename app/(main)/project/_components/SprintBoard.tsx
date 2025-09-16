"use client";

import { IssueWithAssigneeReporter, ProjectWithSprints } from "@/app/types";
import { Issue, IssueStatus, SprintStatus } from "@/lib/generated/prisma";
import { useEffect, useState } from "react";
import SprintManager from "./SprintManager";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { IssueStatuses, IssueStatusesType } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateIssueDrawer from "./CreateIssueDrawer";
import useFetch from "@/app/hooks/useFetch";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";
import { BarLoader } from "react-spinners";
import IssueCard from "./IssueCard";
import { toast } from "sonner";

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
    error: issuesError,
    isLoading: isIssuesLoading,
    fn: actionGetIssuesForSprint,
  } = useFetch(getIssuesForSprint);

  const {
    fn: actionUpdateIssueOrder,
    isLoading: isIssueUpdating,
    error: issueUpdateError,
  } = useFetch(updateIssueOrder);

  const [issuesData, setIssuesData] =
    useState<Array<IssueWithAssigneeReporter>>();

  useEffect(() => {
    if (currentSprint.id) {
      (async () => {
        const issues = await actionGetIssuesForSprint(currentSprint.id);
        setIssuesData(issues as IssueWithAssigneeReporter[]);
      })();
    }
  }, [currentSprint.id]);

  useEffect(() => {
    if (issueUpdateError) {
      toast.error(issueUpdateError.message);
    }
  }, [issueUpdateError]);

  const onDragEnd = async (result: DropResult<string>) => {
    if (currentSprint.status === SprintStatus.PLANNED) {
      toast.warning("Start the sprint to update the board");
      return;
    }
    if (currentSprint.status === SprintStatus.COMPLETED) {
      toast.warning("Start the sprint to update the board");
      return;
    }

    const { destination, source } = result;

    if (
      (destination?.droppableId === source.droppableId &&
        destination?.index === source.index) ||
      !issuesData ||
      !destination
    ) {
      return;
    }

    const newOrderedData = [...issuesData];

    const sourceList = newOrderedData.filter(
      (issue) => issue.status === source.droppableId
    );

    //If card is dragged and dropped in the same column i.e. re-ordered
    if (source.droppableId === destination.droppableId) {
      const [removed] = sourceList.splice(source.index, 1);
      sourceList.splice(destination.index, 0, removed);

      sourceList.forEach((card, i) => (card.order = i));
    } else {
      const destinationList = newOrderedData.filter(
        (issue) => issue.status === destination.droppableId
      );

      const [removed] = sourceList.splice(source.index, 1);
      removed.status = destination.droppableId as IssueStatus;
      destinationList.splice(destination.index, 0, removed);

      sourceList.forEach((card, i) => (card.order = i));
      destinationList.forEach((card, i) => (card.order = i));
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    setIssuesData(sortedIssues);
    actionUpdateIssueOrder(sortedIssues);
  };

  const handleAddIssue = (status: IssueStatusesType) => {
    setSelectedStatus(status.key);
    setIsDrawerOpen(true);
  };

  const fetchIssues = async () => {
    setIssuesData(undefined);
    const issues = await actionGetIssuesForSprint(currentSprint.id);
    setIssuesData(issues as IssueWithAssigneeReporter[]);
  };

  if (issuesError) {
    return <div>Error loading Issues</div>;
  }

  return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={project.sprints}
        projectId={project.id}
      />

      {(isIssueUpdating || isIssuesLoading) && (
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

                  {issuesData
                    ?.filter((issue) => issue.status === status.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        isDragDisabled={isIssueUpdating as boolean}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <IssueCard
                              issue={issue}
                              onDelete={fetchIssues}
                              onUpdate={(updatedIssueData) => {
                                setIssuesData((issues) => {
                                  return issues?.map((issue) => {
                                    if (issue.id === updatedIssueData.id) {
                                      return updatedIssueData;
                                    }
                                    return issue;
                                  });
                                });
                              }}
                              showStatus={false}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

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
        onIssueCreated={fetchIssues}
        sprintId={currentSprint.id}
        status={selectedStatus}
        orgId={orgId}
        projectId={project.id}
      />
    </div>
  );
};

export default SprintBoard;

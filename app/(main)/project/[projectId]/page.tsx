import { fetchProjectById } from "@/actions/projects";
import { notFound } from "next/navigation";
import React from "react";
import CreateSprintForm from "../_components/CreateSprintForm";
import SprintBoard from "../_components/SprintBoard";

type ProjectParams = Promise<{ projectId: string }>;

const ProjectPage = async ({ params }: { params: ProjectParams }) => {
  const { projectId } = await params;
  const project = await fetchProjectById(projectId);

  if (!project) {
    return notFound();
  }

  return (
    <div className="container w-full">
      <CreateSprintForm
        project={project}
        sprintKey={`${project.key}-Sprint-${
          (project.sprints?.length || 0) + 1
        }`}
      />

      {project.sprints.length ? (
        <SprintBoard project={project} orgId={project.organizationId} />
      ) : (
        <div>Create a Sprint from button above</div>
      )}
    </div>
  );
};

export default ProjectPage;

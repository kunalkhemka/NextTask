import { fetchAllProjectsForOrganization } from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/lib/generated/prisma";
import Link from "next/link";
import React from "react";
import DeleteProject from "../../project/_components/DeleteProject";

const ProjectsList = async () => {
  const projectsList: Project[] = await fetchAllProjectsForOrganization();

  if (!projectsList.length) {
    return <p>No Projects created yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projectsList.map((project) => {
        return (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {project.name}
                <DeleteProject projectId={project.id} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {project.description}
              </p>
              <Link
                href={`/project/${project.id}`}
                className="text-blue-500 hover:underline"
              >
                View Project
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProjectsList;

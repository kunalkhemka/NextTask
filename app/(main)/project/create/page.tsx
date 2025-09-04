"use client";

import { createProject } from "@/actions/projects";
import useFetch from "@/app/hooks/useFetch";
import { ProjectFormData, projectSchema } from "@/app/utils/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CreateProjectPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  const {
    data,
    isLoading,
    error,
    fn: actionCreateProject,
  } = useFetch(createProject);

  useEffect(() => {
    if (data) {
      const projectData = data as Project;
      toast.success("Project created successfully");
      router.push(`/project/${projectData.id}`);
    }
  }, [isLoading]);

  const onSubmit = async (data: ProjectFormData) => {
    await actionCreateProject(data);
  };

  return (
    <div className="container mx-auto py-10 max-w-100">
      <h1 className="text-6xl text-center font-bold mb-8 gradient-title">
        Create New Project
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div>
          <Input
            id="projectName"
            placeholder="Enter Project Name"
            className="bg-white"
            {...register("projectName")}
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.projectName.message}
            </p>
          )}
        </div>

        <div>
          <Input
            id="projectKey"
            {...register("projectKey")}
            className="bg-white"
            placeholder="Enter Project Key (Ex: ABC)"
          />
          {errors.projectKey && (
            <p className="text-red-500 text-sm mt-1">
              {errors.projectKey.message}
            </p>
          )}
        </div>

        <div>
          <Textarea
            id="description"
            {...register("description")}
            className="bg-white h-28"
            placeholder="Enter Project Description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <Button
          disabled={isLoading as boolean}
          size="lg"
          type="submit"
          className="bg-blue-500 text-white cursor-pointer"
        >
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
      </form>
    </div>
  );

  return <div></div>;
};

export default CreateProjectPage;

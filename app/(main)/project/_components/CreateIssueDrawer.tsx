"use client";

import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organization";
import useFetch from "@/app/hooks/useFetch";
import { IssueFormData, IssueSchema } from "@/app/utils/validations";
import MDEditor from "@uiw/react-md-editor";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueStatus, User } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { BarLoader } from "react-spinners";
import { IssuePriority } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type params = {
  isOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  sprintId: string;
  status: IssueStatus | null;
  projectId: string;
  onIssueCreated: Function;
  orgId: string;
};

const CreateIssueDrawer = ({
  isOpen,
  setIsDrawerOpen,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}: params) => {
  const {
    isLoading: isCreateIssueLoading,
    fn: actionCreateIssue,
    error: createIssueError,
    data: createdIssueData,
  } = useFetch(createIssue);

  const {
    isLoading: isGetUsersLoading,
    fn: actionGetOrganizationUsers,
    error: getUsersError,
    data: usersData,
  } = useFetch(getOrganizationUsers);

  useEffect(() => {
    if (isOpen && orgId) {
      reset();
      actionGetOrganizationUsers(orgId);
    }
  }, [isOpen, orgId]);

  useEffect(() => {
    if (createdIssueData) {
      reset();
      setIsDrawerOpen(false);
      onIssueCreated();
      toast.success("Issue added successfully");
    }
  }, [createdIssueData, isCreateIssueLoading]);

  const onSubmit = async (data: IssueFormData) => {
    await actionCreateIssue(projectId, {
      ...data,
      status,
      sprintId,
    });
  };

  const {
    control,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(IssueSchema),
    defaultValues: {
      description: "",
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="flex pb-2 px-2">
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>
        {isGetUsersLoading && <BarLoader width={"100%"} />}
        <form
          className="flex flex-col gap-4 w-full sm:w-[70%] m-auto overflow-y-auto sm:overflow-hidden"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium mb-1"
              >
                Assignee
              </label>
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {(usersData as User[])?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={field.onChange}
                  className="w-[99%] flex m-auto"
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium mb-1"
            >
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  name="priority"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(IssuePriority).map((key) => (
                      <SelectItem key={key} value={key}>
                        {IssuePriority[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>

          {createIssueError && (
            <p className="text-red-500 mt-2">{createIssueError.message}</p>
          )}

          <Button
            type="submit"
            disabled={isCreateIssueLoading as boolean}
            className="w-[150]"
          >
            {isCreateIssueLoading ? "Creating...." : "Create Issue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateIssueDrawer;

"use client";

import { deleteProject } from "@/actions/projects";
import useAdmin from "@/app/hooks/useAdmin";
import useFetch from "@/app/hooks/useFetch";
import { SuccessResponse } from "@/app/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { LoaderIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const DeleteProject = ({ projectId }: { projectId: string }) => {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const {
    data,
    error,
    isLoading,
    fn: actionDeleteProject,
  } = useFetch(deleteProject);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await actionDeleteProject(projectId);
    if (!error) {
      closeDialog();
      router.refresh();
    }
  };

  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (data) {
      const deleteResponse = data as SuccessResponse;
      if (deleteResponse.success) {
        toast.success("Project deleted successfully");
      }
    }
  }, [data]);

  if (!isAdmin) {
    return <></>;
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Trash2 className="h-4 w-4 cursor-pointer" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="w-full flex flex-col">
              <div className="flex self-end gap-2">
                <AlertDialogCancel className="cursor-pointer">
                  No
                </AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer w-15"
                  onClick={handleDelete}
                >
                  {isLoading ? <LoaderIcon /> : "Yes"}
                </AlertDialogAction>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 self-center">
                  {error.message}
                </p>
              )}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className={isLoading && "animate-pulse"}
        disabled={isLoading as boolean}
      >
        <Trash2 className="h-4 w-4" />
      </Button> */}
    </>
  );
};

export default DeleteProject;

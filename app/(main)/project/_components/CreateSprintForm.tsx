"use client";

import { createSprint } from "@/actions/sprint";
import useFetch from "@/app/hooks/useFetch";
import { ProjectWithSprints } from "@/app/types";
import { SprintFormData, SprintSchema } from "@/app/utils/validations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sprint } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const CreateSprintForm = ({
  project,
  sprintKey,
}: {
  project: ProjectWithSprints;
  sprintKey: string;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 14),
  });
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SprintSchema),
    defaultValues: {
      name: sprintKey,
      startDate: dateRange.from,
      endDate: dateRange.to,
    },
  });

  const {
    data,
    error,
    isLoading,
    fn: actionCreateSprint,
  } = useFetch(createSprint);

  useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      name: sprintKey,
    }));
  }, [sprintKey, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    } else if (data) {
      const sprintData = data as Sprint;
      toast.success("Sprint created successfully");
    }
  }, [project, error, reset]);

  const onSubmit = async (data: SprintFormData) => {
    await actionCreateSprint(project.id, {
      ...data,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });

    setShowForm(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center sm:flex-row sm:justify-between sm:items-start sm:max-w-150 m-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 sm:mb-8 gradient-title">
          {project.name}
        </h1>
        {!showForm && (
          <Button
            className="mt-2 cursor-pointer"
            onClick={() => setShowForm(!showForm)}
          >
            Create New Sprint
          </Button>
        )}
      </div>
      {showForm && (
        <Card className="pt-4 sm:max-w-200 mx-auto mb-4">
          <CardContent>
            <form
              className="flex flex-col sm:flex-row gap-4 items-center sm:items-end"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex-1">
                <label htmlFor="name">Sprint name</label>
                <Input type="text" id="name" {...register("name")} readOnly />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 self-center">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sprint Duration
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start cursor-pointer text-left font-normal ${
                        !dateRange && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        format(dateRange.from, "LLL dd, y") +
                        " - " +
                        format(dateRange.to, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto" align="start">
                    <Calendar
                      mode="range"
                      disabled={[{ before: new Date() }]}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                        }
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="cursor-pointer">
                {isLoading ? "Creating Sprint..." : "Create Sprint"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowForm(!showForm)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateSprintForm;

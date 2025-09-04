import { IssueStatus } from "@/lib/generated/prisma";

export type IssueStatusesType = { name: string; key: IssueStatus };

export const IssueStatuses: Array<IssueStatusesType> = [
  {
    name: "Todo",
    key: IssueStatus.TODO,
  },
  {
    name: "In Progress",
    key: IssueStatus.IN_PROGRESS,
  },
  {
    name: "In Review",
    key: IssueStatus.IN_REVIEW,
  },
  {
    name: "Done",
    key: IssueStatus.DONE,
  },
];

export type IssuePriorityType = Record<string, string>;

export const IssuePriority: IssuePriorityType = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_COLOR = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

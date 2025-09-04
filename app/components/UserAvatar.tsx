import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/generated/prisma";
import React from "react";

const UserAvatar = ({ user }: { user: User }) => {
  return (
    user?.imageUrl &&
    user?.name && (
      <div className="flex items-center space-x-2 w-full">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          <AvatarFallback className="capitalize">
            {user?.name ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-gray-500">
          {user ? user.name : "Unassigned"}
        </span>
      </div>
    )
  );
};

export default UserAvatar;

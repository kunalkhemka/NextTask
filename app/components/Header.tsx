import { getOrCreateUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import React from "react";
import UserMenu from "@/app/components/UserMenu";
import Link from "next/link";
import Image from "next/image";
import UserLoading from "./UserLoading";
import { PenBox } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

const Header = async () => {
  await getOrCreateUser();
  const { orgId, has } = await auth();
  const isAdmin = has({ role: "admin" });

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            <Image
              src={"/logo.png"}
              alt="NextTask Logo"
              width={200}
              height={56}
              className="h-10 w-auto object-contain"
            />
          </h1>
        </Link>
        <div>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline" className="cursor-pointer">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              {orgId && isAdmin && (
                <Link href="/project/create">
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <PenBox size={18} />
                    <span className="hidden md:inline">Create Project</span>
                  </Button>
                </Link>
              )}
              <UserMenu />
            </div>
          </SignedIn>
        </div>
      </nav>
      <UserLoading />
    </header>
  );
};

export default Header;

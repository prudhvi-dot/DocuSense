import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { FilePlus2 } from "lucide-react";
import Image from "next/image";

const Header = () => {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b">
      <Link href="/dashboard">
      <Image src="/logo.png" width={146} height={146} alt="Docusense logo"/>
      </Link>

      <SignedIn>
        <div className="flex items-center space-x-2">
          <Button asChild variant="link" className="hidden md:flex">
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/dashboard">My Documents</Link>
          </Button>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/dashboard/upload">
              <FilePlus2 />
            </Link>
          </Button>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default Header;

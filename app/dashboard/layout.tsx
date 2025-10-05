import Header from "@/components/Header";
import { ClerkLoaded } from "@clerk/nextjs";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkLoaded>
      <div className="flex flex-col flex-1 h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ClerkLoaded>
  );
};

export default layout;

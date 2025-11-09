import React from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/DB/prisma";
import PdfView from "@/components/PdfView";
import Chat from "@/components/Chat";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  await auth.protect();

  const { id } = await params;

  const file = await prisma.document.findFirst({
    where: {
      id: id,
    },
  });

  const url = file?.fileUrl;
  return (
    <div className="grid lg:grid-cols-6 h-full overflow-hidden bg-gray-100">
      <div className="col-span-6 lg:col-span-3 overflow-y-auto">
        <PdfView url={url as string} />
      </div>
      <div className="col-span-6 lg:col-span-3 overflow-y-auto border border-r-2">
        <Chat id={id} />
      </div>
    </div>
  );
};

export default page;

import React from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/DB/prisma";
import PdfView from "@/components/PdfView";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  await auth.protect();
  const { userId } = await auth();

  const { id } = await params;

  const file = await prisma.document.findFirst({
    where: {
      id: id,
    },
  });

  const url = file?.fileUrl;
  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden bg-gray-100 px-5">
      <div className="col-span-5 lg:col-span-2 overflow-auto">
        <PdfView url={url as string} />
      </div>
      <div className="col-span-5 lg:col-span-3 overflow-y-auto"></div>
    </div>
  );
};

export default page;

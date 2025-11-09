"use client"

import { useRouter } from "next/navigation";
import React from "react";
import { File, Delete, Download } from "lucide-react";

interface Doc {
    // userId: string;
    id: string;
    // createdAt: Date;
    title: string;
    // fileUrl: string;
    // publicId: string;
}

const Document = ({ doc }: { doc: Doc }) => {
    const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/dashboard/files/${doc.id}`)}
      key={doc.id}
      className="flex cursor-pointer flex-col items-center justify-center w-44 h-60 rounded bg-gray-200 drop-shadow-md text-gray-400"
    >
      <File className="h-12 w-12" />
      <p>{doc.title}</p>

      <div className="flex gap-2.5 ml-auto px-1">
        <Delete className="w-26"/>
        <Download className="h-26"/>
      </div>
    </div>
  );
};

export default Document;

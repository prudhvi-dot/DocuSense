"use client"

import { useRouter } from "next/navigation";
import React from "react";
import { File, Download, Trash2} from "lucide-react";
import { deleteFile } from "@/actions";

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
      key={doc.id}
      className="flex cursor-pointer flex-col items-center justify-between w-44 h-60 rounded bg-gray-200  transition duration-300 drop-shadow-md text-gray-400"
    >
      <p onClick={() => router.push(`/dashboard/files/${doc.id}`)} className="hover:text-black">{doc.title}</p>
      <File onClick={() => router.push(`/dashboard/files/${doc.id}`)} className="h-12 w-12 hover:text-black" />

      <div className="flex gap-1 justify-end p-2">
        <Trash2 onClick={()=>{
          deleteFile(doc.id)
          router.refresh()
        }} className="w-26 hover:text-black"/>
        <Download className="w-26 hover:text-black"/>
      </div>
    </div>
  );
};

export default Document;

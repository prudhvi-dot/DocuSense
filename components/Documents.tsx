import React from "react";
import PlaceholderDocument from "./PlaceholderDocument";
import { prisma } from "@/DB/prisma";
import { auth } from "@clerk/nextjs/server";
import Document from "./Document";



const Documents = async() => {
  const {userId} = await auth();

const documents = await prisma.document.findMany({
  where: {
    userId: userId as string
  }
})
  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-centerlg:justfy-start rounded-sm gap-5 max-w-7xl mx-auto">
      <PlaceholderDocument />
      {
        documents.map((doc)=>(
          
          <Document key={doc.id} doc={{id:doc.id, title: doc.title}}/>
        ))
      }
    </div>
  );
};

export default Documents;

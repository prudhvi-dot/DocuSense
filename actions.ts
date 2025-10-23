"use server"

import { generateEmbeddingsPineconeVectorStore } from "./lib/langchain";
import { auth } from "@clerk/nextjs/server"; 
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./DB/prisma";
import { redirect } from "next/navigation";


interface file {
  title: string;
  fileUrl: string;
  publicId: string;
  userId: string;
}

export async function handleFileUpload(files: File[]) {
  const user = await currentUser();
    const formData = new FormData();

    const file = files[0];

    formData.append("file", file);
    formData.append("upload_preset", "DocuSense");
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadedFile = await response.json();

    const fileData = {
      title: uploadedFile.original_filename,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      userId: user?.id,
    };


  const doc = await prisma.document.create({
    data: fileData as file
  })

  await generateEmbeddings(doc.id);

  redirect(`/dashboard/files/${doc.id}`)
}

export async function saveUser() {
    const user = await currentUser();

    if(!user) return null;

    await prisma.user.upsert({
        where: {id: user.id},
        update: {},
        create: {
            id: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: user.firstName || ""
        }
    })
}

export async function generateEmbeddings(docId:string) {
  
  await generateEmbeddingsPineconeVectorStore(docId);
  revalidatePath("/dashboard");
  return {completed:true};
}


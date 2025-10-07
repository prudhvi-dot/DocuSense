"use server"


import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./DB/prisma";


interface file {
  title: string;
  fileUrl: string;
  publicId: string;
  userId: string;
}

export async function handleFileUpload(files: File[]) {
  const user = await currentUser();
  const filesTOBeAdded: file[] = [];
  for (const file of files) {
    const formData = new FormData();

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

    const fileDate = {
      title: uploadedFile.original_filename,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      userId: user?.id,
    };

    filesTOBeAdded.push(fileDate as file);
  }

  await prisma.document.createMany({
    data: filesTOBeAdded,
  });

  // redirect('/dashboard')
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
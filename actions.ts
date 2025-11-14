"use server";

import { UserDetals } from "./app/dashboard/upgrade/page";
import {
  generateEmbeddingsPineconeVectorStore,
  generateLangchainCompletion,
} from "./lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./DB/prisma";
import { redirect } from "next/navigation";
import stripe from "./lib/stripe";
import getBaseUrl from "./lib/getBaseUrl";
import pineconeClient from "./lib/pinecone";
// import { FREE_LIMIT } from "./hooks/useSubscription";

const FREE_LIMIT = 3;

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
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);

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
    data: fileData as file,
  });

  await generateEmbeddings(doc.id);

  redirect(`/dashboard/files/${doc.id}`);
}

export async function saveUser() {
  const user = await currentUser();

  if (!user) return null;

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: user.firstName || "",
    },
  });
}

export async function generateEmbeddings(docId: string) {
  await generateEmbeddingsPineconeVectorStore(docId);
  revalidatePath("/dashboard");
  return { completed: true };
}

export async function askQuestion(id: string, question: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }
  let chat = await prisma.chat.findUnique({
    where: {
      documentId: id,
    },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        documentId: id,
      },
    });
  }
  const userMessages = await prisma.message.findMany({
    where: {
      chatId: chat.id,
      role: "human",
    },
  });


  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });


  if (!user?.hasProPlan && userMessages.length >= FREE_LIMIT) {
    return {
      success: false,
      message: `Please upgrade to pro plan to ask more than ${FREE_LIMIT} questions.`,
    };
  }

  await prisma.message.create({
    data: {
      message: question,
      role: "human",
      chatId: chat.id,
    },
  });

  const reply = await generateLangchainCompletion(id, question);

  const aiMessage = await prisma.message.create({
    data: {
      message: reply,
      role: "ai",
      chatId: chat.id,
    },
  });
  return { success: true, message: aiMessage.message };
}

export async function getChatMessages(docId: string) {
  const Messages = await prisma.chat.findUnique({
    where: {
      documentId: docId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return { success: true, messages: Messages?.messages || [] };
}

export async function deleteFile(docId: string) {
  await prisma.document.delete({
    where: {
      id: docId,
    },
  });
  const index = await pineconeClient.index("docusense");
  await index.namespace(docId).deleteAll();
}

export async function createCheckoutSession(UserDetals: UserDetals) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  let stripeCustomerId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  stripeCustomerId = user?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: UserDetals.email,
      name: UserDetals.name,
      metadata: {
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    const stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1SSVlyDwlKlmlhyHXiOEzCPa",
        quantity: 1,
      },
    ],
    mode: "subscription",
    customer: stripeCustomerId!,
    success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
    cancel_url: `${getBaseUrl()}/dashboard`,
  });

  return session.url;
}

export async function createStripePortal() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const stripeCustomerId = user?.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getBaseUrl()}/dashboard`,
  });

  return session.url;
}

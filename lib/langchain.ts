import { NamespaceSummary } from './../node_modules/@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data/models/NamespaceSummary.d';
import { Pinecone } from '@pinecone-database/pinecone';
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {createRetrievalChain} from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from './pinecone';
import {PineconeStore} from "@langchain/pinecone";
import { PineconeConflictError } from '@pinecone-database/pinecone/dist/errors';
import {Index, RecordMetadata} from "@pinecone-database/pinecone";
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/DB/prisma';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HuggingFaceInference } from "@langchain/community/llms/hf";


const model = new HuggingFaceInference({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "google/flan-t5-large", // ✅ fully supported
  temperature: 0.7,
});


async function fetchMessagesFromDB(docId:string) {
  const chat = await prisma.chat.findFirst({
    where: {
      documentId: docId
    }
  })

  const messages = await prisma.message.findMany({
    where: {
      chatId: chat?.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const chatHistory = messages.map((msg) => {
    if(msg.role === "human") {
      return new HumanMessage(msg.message);
    } else {
      return new AIMessage(msg.message);
    }
  })

  console.log(chatHistory.map((m) => m.text.toString()));

  return chatHistory
}

export const indexName = "docusense";

export async function generateDocs(docId:string) {
    const {userId} = await auth();

    if(!userId) throw new Error("User not found");

    const file = await prisma.document.findFirst({
        where:{
            id:docId
        }
    });

    const downloadUrl = file?.fileUrl;

    if(!downloadUrl) {
        throw new Error("Download URL not found");
    }

    const response = await fetch(downloadUrl);

    const data =  await response.blob();

    const loader = new PDFLoader(data);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(splitDocs.length);

    return splitDocs;
}

async function namespaceExists(index:Index<RecordMetadata>,namespace:string) {
    if(namespace===null) throw new Error("No namespace values provided");
    const {namespaces} = await index.describeIndexStats();

    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    return await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
  }

  const splitDocs = await generateDocs(docId);


  return await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex: index,
    namespace: docId,
  });
}


async function generateLangchainCompletion (docId:string, question:string) {
  let pinecneVectorStore;

  pinecneVectorStore = await generateEmbeddingsPineconeVectorStore(docId);

  console.log("---- Creating a retriever ----")

  if(!pinecneVectorStore) {
    throw new Error("Pinecone Vector Store not found");
  }

  const retriever = pinecneVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation."
    ]
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  const historyAwareRetrivalPrompt = ChatPromptTemplate.fromMessages([
    [
    "system",
    "Answer the user's question based on the below context:\n\n{context}"
    ],
    ...chatHistory,
    ["user", "{input}"]
  ]);

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrivalPrompt,
  });

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply.answer);

  return reply.answer
}

export {model, generateLangchainCompletion}
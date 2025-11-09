import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {createRetrievalChain} from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from './pinecone';
import {PineconeStore} from "@langchain/pinecone";
import {Index, RecordMetadata} from "@pinecone-database/pinecone";
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/DB/prisma';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY, 
  model: "gemini-2.5-flash", 
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

    const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800, // Recommended size: 500-1000 characters
    chunkOverlap: 100, // Recommended overlap: 50-200 characters
});
    const splitDocs = await splitter.splitDocuments(docs);

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

  const pinecneVectorStore = await generateEmbeddingsPineconeVectorStore(docId);

  if(!pinecneVectorStore) {
    throw new Error("Pinecone Vector Store not found");
  }

  const retriever = pinecneVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  const trimmedHistory = chatHistory.slice(-5);

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...trimmedHistory,
    ["user", "{input}"],
    
  [
      "user",
      "Based ONLY on the user's latest message, generate a single, highly specific search query to retrieve the exact information needed to answer the question. Only include details necessary for the search."
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
    "You are an assistant answering questions about a document. Answer ONLY the final question from the user, using ONLY the context provided below. Do not repeat previous answers or include information not explicitly asked for.\n\nContext:\n{context}"
    ],
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


  return reply.answer
}

export {model, generateLangchainCompletion}
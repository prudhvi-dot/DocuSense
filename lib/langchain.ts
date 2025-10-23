import { NamespaceSummary } from './../node_modules/@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data/models/NamespaceSummary.d';
import { Pinecone } from '@pinecone-database/pinecone';
import {ChatOpenAI} from "@langchain/openai";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
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

// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-1.5-flash", // or gemini-1.5-pro
//   apiKey: process.env.GOOGLE_API_KEY,
// });

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

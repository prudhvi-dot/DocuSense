# DocuSense: Chat with Your Documents 🚀

DocuSense is a production-ready SaaS platform that transforms static documents into interactive conversations. Using a **Retrieval-Augmented Generation (RAG)** architecture, it allows users to extract insights from PDFs and text files instantly using Google's Gemini 2.5 Flash.



---

## ✨ Features

- **Semantic Document Search:** Go beyond keyword matching—understand the context of your files.
- **Source-Grounded Responses:** AI answers are backed by specific citations from your uploaded documents.
- **High-Performance Vector Storage:** Lightning-fast retrieval using Pinecone.
- **Modern Tech Stack:** Built for scale with Next.js and serverless infrastructure.
- **Secure Payments:** Integrated Stripe subscription management for Pro features.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), Tailwind CSS |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Neon DB](https://neon.tech/)) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **AI Engine** | [Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) |
| **Orchestration** | [LangChain](https://www.langchain.com/) |
| **Vector DB** | [Pinecone](https://www.pinecone.io/) |
| **Embeddings** | [Hugging Face Inference API](https://huggingface.co/inference-api) |
| **Payments** | [Stripe](https://stripe.com/) |

---

## 🧠 System Architecture

The application follows a robust RAG workflow:
1. **Document Ingestion:** Files are parsed and split into chunks using LangChain’s recursive character splitters.
2. **Vectorization:** Text chunks are converted into 768-dimensional (or relevant) vectors via Hugging Face embeddings.
3. **Upserting:** Vectors and metadata are stored in a Pinecone index.
4. **Contextual Retrieval:** User queries are embedded and compared against the vector store using Cosine Similarity.
5. **LLM Synthesis:** The top-k relevant chunks are fed into Gemini 2.5 Flash to generate a natural language response.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following API keys:
- `GEMINI_API_KEY`
- `PINECONE_API_KEY`
- `HUGGINGFACE_TOKEN`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL` (Neon/PostgreSQL)

### Installation

1. **Clone the Repo:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/docusense.git](https://github.com/YOUR_USERNAME/docusense.git)
   cd docusense

1. **Install Dependencies:**
   ```bash
   npm install

1. **Set Up Environment Variables:**
   ```bash
   DATABASE_URL="your_database_url"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   PINECONE_API_KEY_First="your_pinecone_api_key_first"
   PINECONE_API_KEY="your_pinecone_api_key"
   PINECONE_ENVIRONMENT="your_pinecone_environment"
   GOOGLE_API_KEY="your_google_api_key"
   HUGGINGFACE_API_KEY="your_huggingface_api_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   NEXT_PUBLIC_BASE_URL="your_base_url"
   STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

1. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   
1. **Start Development Server:**
   ```bash
   npm run dev

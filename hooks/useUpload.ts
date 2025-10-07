'use client'

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum Statustext {
    UPLOADING = "Uploading file...",
    UPLOADED = "File uploaded successfully",
    SAVING = "Saving file to database...",
    GENERATING = "Generating AI Embeddings, THis wil only take few seconds..."
}

export type Status = Statustext[keyof Statustext];

function useUpload() {
    const [progress, setProgress] = useState<number | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const {user} = useUser();

    const router = useRouter();

    const handleUpload = async (file: File) => {
        if (!file || !user) return;

        const fileToUploadTo = uuidv4();
    }
}

export default useUpload;
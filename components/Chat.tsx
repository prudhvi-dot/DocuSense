"use client";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { askQuestion, getChatMessages } from "@/actions";
import { BotIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export type Message = {
  id?: string;
  role: "human" | "ai";
  message: string;
  createdAt: Date;
};
const Chat = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const { user } = useUser();

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadMessages() {
      const res = await getChatMessages(id);
      if (res.success) setMessages(res.messages);
    }
    loadMessages();
  }, [id]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: question,
        createdAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(id, question);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          message: success ? message : `Whoops: ${message}`,
          createdAt: new Date(),
        };
        return updated;
      });
    });
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 w-full overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">
            No messages yet. Start a conversation!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex mb-3.5${
                msg.role === "human"
                  ? "justify-start flex-row-reverse"
                  : "justify-start"
              }`}
            >
              <div className="flex items-end">
                {msg.role === "human" ? (
                  <Image
                    src={user?.imageUrl || ""}
                    alt="profile picture"
                    width={33}
                    height={33}
                    className="rounded-full ml-0.5"
                  />
                ) : (
                  // <BotIcon/>
                  <div className="flex items-end">
                    <BotIcon className="w-7 h-7 mr-0.5" />
                  </div>
                )}
              </div>
              <div
                className={`relative max-w-[75%] p-3 text-sm shadow-md rounded-2xl break-words ${
                  msg.role === "human"
                    ? "bg-[#0f0f0f] text-white rounded-br-none"
                    : "bg-white text-black rounded-bl-none"
                }`}
              >
                <p>{msg.message}</p>
                <span className="block text-[10px] mt-1 opacity-60 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={divRef}></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 space-x-0 p-5 bg-neutral-800"
      >
        <Input
          placeholder="Ask a Question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-white"
        />
        <Button className="mx-1.5" type="submit" disabled={!input || isPending}>
          {isPending ? <Loader2Icon className="animate-spin h-5 w-5" /> : "Ask"}
        </Button>
      </form>
    </div>
  );
};

export default Chat;

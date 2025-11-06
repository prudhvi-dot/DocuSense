"use client";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { askQuestion, getChatMessages } from "@/actions";
import { get } from "http";

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
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex-1 w-full overflow-y-auto p-4 space-y-3">
  {messages.length === 0 ? (
    <p className="text-center text-gray-400">No messages yet. Start a conversation!</p>
  ) : (
    messages.map((msg, idx) => (
      <div
        key={idx}
        className={`flex ${
          msg.role === "human" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-md ${
            msg.role === "human"
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-neutral-700 text-gray-100 rounded-bl-none"
          }`}
        >
          <p>{msg.message}</p>
          <span className="block text-[10px] mt-1 opacity-60">
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    ))
  )}
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

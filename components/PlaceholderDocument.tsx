"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { PlusCircleIcon } from "lucide-react";

const PlaceholderDocument = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/upload");
  };
  return (
    <Button
      onClick={handleClick}
      className="flex cursor-pointer flex-col items-center justify-center w-64 h-80 rounded bg-gray-200 drop-shadow-md text-gray-400"
    >
      <PlusCircleIcon className="h-36 w-36" />
      <p>Add a document</p>
    </Button>
  );
};

export default PlaceholderDocument;

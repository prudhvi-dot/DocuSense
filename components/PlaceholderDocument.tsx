"use client";
import { useRouter } from "next/navigation";
import { PlusCircleIcon, FrownIcon } from "lucide-react";
import useSubscription from "@/hooks/useSubscription";

const PlaceholderDocument = () => {
  const router = useRouter();
  const {isOverFileLimit} = useSubscription();

  const handleClick = () => {
    router.push("/dashboard/upload");
  };

  if(isOverFileLimit) {
    return (
      <div>
        <div
      className="flex cursor-pointer flex-col items-center justify-center w-44 h-60 rounded bg-gray-200 drop-shadow-md text-gray-400"
    >
      <FrownIcon className="w-12 h-12"/>
 
      <p>File Limit Over</p>
    </div>
      </div>
    )
  }
  return (
    <div onClick={handleClick}
      className="flex cursor-pointer flex-col items-center justify-center w-44 h-60 rounded bg-gray-200 drop-shadow-md text-gray-400"
    >
      <PlusCircleIcon className="w-12 h-12"/>
 
      <p>Add a document</p>
    </div>
  );
};

export default PlaceholderDocument;

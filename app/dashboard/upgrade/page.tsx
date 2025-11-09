import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div>
      <div className="py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Supercharge your Document Companion
          </p>
          <p className="mt-6 text-gray-600 leading-8">
            Choose an affordable plan thats packed with the best features for
            interacting with your PDFs, enhancing productivity, and streamlining
            your workflow
          </p>
        </div>

        <div className="max-w-md mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl px-1">
            <div className="ring-1 ring-gray-200 p-8 h-fit pb-12 rounded-3xl">
                <h3 className="text-lg font-semibold leading-8 text-black">Starter Plan</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">Explore Core Feature at No Cost</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-black">Free</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 tezt-gray-600">
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>2 Documents
                    </li>
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>Up to 3 messages per document
                    </li>
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>Try out AI Chat Functionality
                    </li>
                </ul>
            </div>
            <div className="ring-2 ring-black rounded-3xl p-8">
                <h3 className="text-lg font-semibold leading-8 text-black">Pro plan</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                    Maximize Productivity with PRO Features
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-black">$5.99</span>
                    <span className="text-sm font-semibold leading-6 text-black">/ month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 tezt-gray-600">
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>Store upto 20 Documents
                    </li>
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>Ability to Delete Documents
                    </li>
                    <li className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 fexl-none text-black"/>Up to 100 messages per Document
                    </li>
                </ul>
                <Button className="w-full mt-4 text-black shadow-sm rounded-md px-3 py-2 font-semibold bg-white border-2 border-black hover:text-white hover:bg-black">Upgrade to Pro</Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default page;

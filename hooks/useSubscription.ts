"use client"

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

function useSubscription() {
    const [hasActiveMembership, setHasActiveMembership] = useState(false);
    const [isOverFileLimit, setIsOverFileLimit] = useState(false);
    const {user} = useUser()
}

export default useSubscription;
"use client"

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const PRO_LIMIT = 20;
export const FREE_LIMIT = 2;

function useSubscription() {
    const [hasActiveMembership, setHasActiveMembership] = useState(false);
    const [isOverFileLimit, setIsOverFileLimit] = useState(false);
    const {user} = useUser();

    useEffect(() => {
        async function fetchSubscription() {
            if(!user) return;
            const res = await fetch("/api/user/plan");
            if(!res.ok) {
                setHasActiveMembership(false);
                setIsOverFileLimit(false);
                return;
            }
            const data = await res.json();

            const {hasProPlan, fileCount} = data;

            console.log(hasProPlan)

            setHasActiveMembership(hasProPlan);
            const userLimit = hasProPlan ? PRO_LIMIT : FREE_LIMIT;
            setIsOverFileLimit(fileCount >= userLimit);
        }
        fetchSubscription();
    },[])

    return {hasActiveMembership, isOverFileLimit};
}

export default useSubscription;
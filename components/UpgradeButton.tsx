"use client";

import useSubscription from '@/hooks/useSubscription';
import { useTransition } from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { Loader2Icon, StarIcon } from 'lucide-react';
import { createStripePortal } from '@/actions';

const UpgradeButton = () => {
    const {hasActiveMembership} = useSubscription();
    const [isPending, startTransition] = useTransition();

    if(!hasActiveMembership) {
        return (
            <Button asChild variant="default" className='border-gray-600'>
                <Link href="/dashboard/upgrade">
                    Upgrade <StarIcon className='ml-3 fill-gray-100 text-white'/>
                </Link>
            </Button>
        )
    }

    const handleAccount = () => {
        startTransition(async()=> {
            const stripePortalUrl = await createStripePortal();
            if(stripePortalUrl) {
                window.location.href = stripePortalUrl;
            }
        })
    }
  return (
    <Button
    onClick={handleAccount}
    disabled={isPending}
    variant="default"
    className='border-gray-600 bg-black text-white'
    >
        {isPending ? (
            <Loader2Icon className='animate-spin'/>
        ):(
            <p>
                <span className='font-extrabold'>PRO </span>
                Account
            </p>
        )}

    </Button>
  )
}

export default UpgradeButton
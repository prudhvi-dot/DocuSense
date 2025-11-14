import { headers } from "next/headers";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { prisma } from "@/DB/prisma";
import { toast } from "react-toastify";

export async function POST(request: Request) {
    const headerLit = await headers();
    const body = await request.text();
    const signature = headerLit.get("Stripe-Signature");

    if (!signature) {
        return new Response("Missing Stripe signature", { status: 400 });
    }

    if(!process.env.STRIPE_WEBHOOK_SECRET) {
        console.log("Missing STRIPE_WEBHOOK_SECRET");
        return new Response("Missing Stripe webhook secret", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.log(`Error parsing webhook: ${error}`);
        return new Response(`Webhook Error: ${error}`, { status: 400 });
    }

    const getUserDetails = async (customerId: string) => {
        const user = await prisma.user.findFirst({
            where: {
                stripeCustomerId: customerId
            }
        })

        if(user) {
            return user;
        }
    }

    switch (event.type) {
        case "checkout.session.completed":
        case "payment_intent.succeeded": {
            const invoice = event.data.object;
            const customerId = invoice.customer as string;
            const UserDetals = await getUserDetails(customerId);
            if(!UserDetals) {
                return new Response("User not found", { status: 404 });
            }

            await prisma.user.update({
                where: {
                    id: UserDetals.id
                },
                data: {
                    hasProPlan: true
                }
            });

            break;
        }
        case "customer.subscription.deleted":
        case "subscription_schedule.canceled": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const UserDetals = await getUserDetails(customerId);

            if(!UserDetals) {
                return new Response("User not found", { status: 404 });
            }

            await prisma.user.update({
                where: {
                    id: UserDetals.id
                },
                data: {
                    hasProPlan: false
                }
            });

            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);   
    }

    return new Response("Webhook received", { status: 200 });
}
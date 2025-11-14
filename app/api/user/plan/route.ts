import { prisma } from "@/DB/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const {userId} = await auth();

    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
        where:{
            id: userId   
        },
        include: {
            documents:true
        }
    })

    if(!user) {
        return NextResponse.json({error: "User not found"}, {status: 400})
    }

    const fileCount = user.documents.length || 0;

    return NextResponse.json({
        hasProPlan: user.hasProPlan,
        fileCount
    });
}
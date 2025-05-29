import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function deposit(userId, amount) {
    await prisma.transaction.create({
        data: {
            userId,
            amount: +amount,
            type: "DEPOSIT",
        }
    })
}

export async function withdraw(userId, amount) {
    await prisma.transaction.create({
        data: {
            userId,
            amount: -amount,
            type: "WITHDRAW",
        }
    })
}
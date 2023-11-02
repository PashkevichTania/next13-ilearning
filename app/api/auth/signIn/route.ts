import { NextRequest } from "next/server"
import prisma from "@/app/lib/prisma"
import bcrypt from "bcrypt"

interface Response {
  email: string
  password: string
}
export async function POST(request: NextRequest) {
  try {
    const data: Response = await request.json()
    const { email, password } = data

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return Response.json({ message: `User with email ${email} not found` }, { status: 404 })
    }

    const { hashedPassword } = user

    if (!hashedPassword) {
      return Response.json({ message: `User does not have a set password` }, { status: 400 })
    }

    const passwordMatch = await bcrypt.compare(password, hashedPassword)

    if (!passwordMatch) {
      return Response.json({ message: "Incorrect password" }, { status: 400 })
    }

    return Response.json({ user })
  } catch (e) {
    const error = e as unknown as { message?: string }
    console.error(e)
    return Response.json({ message: error?.message || "something went wrong" }, { status: 500 })
  }
}

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { z } from "zod"

const registerFormSchema = z
  .object({
    name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
    email: z.string().email("Email invalid"),
    password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

type RegisterFormInput = z.infer<typeof registerFormSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  })

  async function onSubmit(data: RegisterFormInput) {
    setServerError(null)

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    })

    let json: { error?: string; success?: boolean } = {}
    try {
      json = await res.json()
    } catch {
      // empty or non-JSON body
    }

    if (!res.ok) {
      setServerError(json.error ?? "A apărut o eroare. Încearcă din nou.")
      return
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    router.push("/account")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f6f1] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            Cont nou
          </h1>
          <p className="mt-2 text-sm text-gray-500">Alătură-te comunității Evernest</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nume
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/20"
              placeholder="Ion Popescu"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/20"
              placeholder="tu@exemplu.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/20"
              placeholder="Minim 8 caractere"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmă parola
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/20"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#6B8E23] py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a7a1c] disabled:opacity-60"
          >
            {isSubmitting ? "Se creează contul..." : "Creează cont"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ai deja cont?{" "}
          <Link href="/login" className="font-medium text-[#6B8E23] hover:underline">
            Intră în cont
          </Link>
        </p>
      </div>
    </div>
  )
}

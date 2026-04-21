import { auth } from "@/lib/auth"
import Sidebar from "@/components/admin/Sidebar"
import Image from "next/image"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin && <Sidebar />}
      <div className={isAdmin ? "lg:pl-64" : ""}>
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-3 flex items-center justify-between">
          {isAdmin && <div className="lg:hidden w-10" />}
          <div className="flex-1" />
          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-tight">
                  {session.user.name ?? session.user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session.user.role?.toLowerCase()}
                </p>
              </div>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none"
                  style={{ backgroundColor: "#6B8E23" }}
                >
                  {(session.user.name ?? session.user.email ?? "A")[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

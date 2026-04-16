import type { UserSummary } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { UserAdminForm } from "@/components/user-admin-form"
import { UserStatusForm } from "@/components/user-status-form"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminUsersPage() {
  await requireSession("ADMIN")
  const response = await fetchApi<{ users: UserSummary[] }>("/api/v1/admin/users")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Users</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Kelola peserta dan admin</h1>
        </div>
        <LogoutButton />
      </header>

      <UserAdminForm />

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Daftar user</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {response.users.map((user) => (
            <div key={user.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-base font-medium text-slate-950">{user.name}</div>
                <div className="mt-2 text-sm text-slate-600">{user.email}</div>
              </div>
              <UserStatusForm
                id={user.id}
                name={user.name}
                role={user.role}
                status={user.status}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

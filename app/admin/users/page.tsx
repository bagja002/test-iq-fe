import type { AdminOverview, UserSummary } from "@iq/openapi"

import { AdminNav } from "@/components/admin-nav"
import { AdminStatCard } from "@/components/admin-stat-card"
import { LogoutButton } from "@/components/logout-button"
import { UserAdminForm } from "@/components/user-admin-form"
import { UserStatusForm } from "@/components/user-status-form"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { readSearchParam } from "@/lib/search-params"

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireSession("ADMIN")

  const params = await searchParams
  const q = readSearchParam(params.q)
  const role = readSearchParam(params.role)
  const status = readSearchParam(params.status)
  const query = new URLSearchParams()
  if (q) query.set("q", q)
  if (role) query.set("role", role)
  if (status) query.set("status", status)

  const [userRes, overviewRes] = await Promise.all([
    fetchApi<{ users: UserSummary[] }>(`/api/v1/admin/users${query.toString() ? `?${query.toString()}` : ""}`),
    fetchApi<{ overview: AdminOverview }>("/api/v1/admin/overview"),
  ])

  const overview = overviewRes.overview

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Users</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Kelola peserta dan admin</h1>
        </div>
        <LogoutButton />
      </header>

      <AdminNav />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total User" value={overview.userStats.total} tone="cyan" />
        <AdminStatCard label="Aktif" value={overview.userStats.active} tone="emerald" />
        <AdminStatCard label="Inactive" value={overview.userStats.inactive} tone="amber" />
        <AdminStatCard label="Admin" value={overview.userStats.adminCount} hint={`Peserta ${overview.userStats.participantCount}`} />
      </section>

      <section className="glass-panel p-6">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau email..."
            className="form-control"
          />
          <select name="role" defaultValue={role} className="form-select">
            <option value="">Semua role</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select name="status" defaultValue={status} className="form-select">
            <option value="">Semua status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            Terapkan Filter
          </button>
        </form>
      </section>

      <UserAdminForm />

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Daftar user</h2>
          <p className="mt-2 text-sm text-slate-600">
            Filter ini membantu admin saat jumlah peserta mulai besar dan perlu cepat menemukan akun tertentu.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {userRes.users.length > 0 ? (
            userRes.users.map((user) => (
              <div key={user.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="text-base font-medium text-slate-950">{user.name}</div>
                  <div className="mt-2 text-sm text-slate-600">{user.email}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Akun {user.accountType}
                  </div>
                </div>
                <UserStatusForm
                  id={user.id}
                  name={user.name}
                  role={user.role}
                  status={user.status}
                  accountType={user.accountType}
                />
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-sm text-slate-600">
              Tidak ada user yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

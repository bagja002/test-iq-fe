import Link from "next/link"

import type { AdminOverview, UserSummary } from "@/lib/api-types"

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

const usersPerPage = 10

function readPage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value
  const page = Number(rawValue ?? "1")
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function buildUsersPageHref(params: URLSearchParams, page: number): string {
  const nextParams = new URLSearchParams(params)
  nextParams.set("page", String(page))
  return `/admin/users?${nextParams.toString()}`
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireSession("ADMIN")

  const params = await searchParams
  const q = readSearchParam(params.q)
  const role = readSearchParam(params.role)
  const status = readSearchParam(params.status)
  const page = readPage(params.page)
  const query = new URLSearchParams()
  if (q) query.set("q", q)
  if (role) query.set("role", role)
  if (status) query.set("status", status)
  query.set("page", String(page))
  query.set("limit", String(usersPerPage + 1))

  const [userRes, overviewRes] = await Promise.all([
    fetchApi<{ users: UserSummary[] }>(`/api/v1/admin/users${query.toString() ? `?${query.toString()}` : ""}`),
    fetchApi<{ overview: AdminOverview }>("/api/v1/admin/overview"),
  ])

  const overview = overviewRes.overview
  const users = (userRes.users ?? []).slice(0, usersPerPage)
  const hasNextPage = (userRes.users ?? []).length > usersPerPage
  const pageQuery = new URLSearchParams()
  if (q) pageQuery.set("q", q)
  if (role) pageQuery.set("role", role)
  if (status) pageQuery.set("status", status)

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
            placeholder="Cari nama, email, atau nomor HP..."
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
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Daftar user</h2>
            <p className="mt-2 text-sm text-slate-600">
              Filter ini membantu admin saat jumlah peserta mulai besar dan perlu cepat menemukan akun tertentu.
            </p>
          </div>
          <div className="text-sm font-medium text-slate-500">Halaman {page}</div>
        </div>
        <div className="overflow-x-auto">
          {users.length > 0 ? (
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">No. HP</th>
                  <th className="px-6 py-4">Akun</th>
                  <th className="px-6 py-4">Dibuat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-6 py-4 font-medium text-slate-950">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.position}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600">{user.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <UserStatusForm
                          id={user.id}
                          name={user.name}
                          position={user.position}
                          role={user.role}
                          status={user.status}
                          accountType={user.accountType}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-10 text-sm text-slate-600">
              Tidak ada user yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Menampilkan maksimal {usersPerPage} user per halaman.
          </div>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={buildUsersPageHref(pageQuery, page - 1)}
                className="inline-flex h-10 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center rounded-2xl border border-slate-100 px-4 text-sm font-medium text-slate-300">
                Previous
              </span>
            )}
            {hasNextPage ? (
              <Link
                href={buildUsersPageHref(pageQuery, page + 1)}
                className="inline-flex h-10 items-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-400">
                Next
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

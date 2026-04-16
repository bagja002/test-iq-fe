import type { TestConfigResponse } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { TestConfigForm } from "@/components/test-config-form"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminSettingsPage() {
  await requireSession("ADMIN")
  const response = await fetchApi<{ config: TestConfigResponse | null }>("/api/v1/admin/test-config")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Settings</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Atur test aktif</h1>
        </div>
        <LogoutButton />
      </header>

      <TestConfigForm config={response.config} />
    </main>
  )
}

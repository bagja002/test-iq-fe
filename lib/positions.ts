export const POSITION_OPTIONS = [
  "Manager - KDMP",
  "Manager Operasional - KNMP",
  "Kepala Produksi - KNMP",
  "Penjamin Mutu - KNMP",
  "Administrasi Keuangan - KNMP",
] as const

export function getSKBRoomCodeForPosition(position: string): string | null {
  switch (position.trim()) {
    case "Manager - KDMP":
      return "MANAJER_KOPERASI_KDMP"
    case "Manager Operasional - KNMP":
      return "MANAGER_OPERASIONAL_KNMP"
    case "Kepala Produksi - KNMP":
      return "KEPALA_PRODUKSI"
    case "Penjamin Mutu - KNMP":
      return "PENJAMIN_MUTU"
    case "Administrasi Keuangan - KNMP":
      return "PENGELOLA_KEUANGAN"
    default:
      return null
  }
}

import type { QuestionIndex } from "@iq/openapi"

export interface SubtestOption {
  code: string
  label: string
  questionIndex: QuestionIndex
}

export const questionIndexOptions: Array<{ value: QuestionIndex; label: string }> = [
  { value: "VCI", label: "VCI · Verbal Comprehension Index" },
  { value: "PRI", label: "PRI · Perceptual Reasoning Index" },
  { value: "WMI", label: "WMI · Working Memory Index" },
  { value: "PSI", label: "PSI · Processing Speed Index" },
  { value: "SKB", label: "SKB · Tes Kompetensi Jabatan" },
]

export const subtestOptions: SubtestOption[] = [
  { code: "SIMILARITIES", label: "Similarities", questionIndex: "VCI" },
  { code: "VOCABULARY", label: "Vocabulary", questionIndex: "VCI" },
  { code: "INFORMATION", label: "Information", questionIndex: "VCI" },
  { code: "COMPREHENSION", label: "Comprehension", questionIndex: "VCI" },
  { code: "BLOCK_DESIGN", label: "Block Design", questionIndex: "PRI" },
  { code: "MATRIX_REASONING", label: "Matrix Reasoning", questionIndex: "PRI" },
  { code: "VISUAL_PUZZLES", label: "Visual Puzzles", questionIndex: "PRI" },
  { code: "PICTURE_COMPLETION", label: "Picture Completion", questionIndex: "PRI" },
  { code: "FIGURE_WEIGHTS", label: "Figure Weights", questionIndex: "PRI" },
  { code: "DIGIT_SPAN", label: "Digit Span", questionIndex: "WMI" },
  { code: "ARITHMETIC", label: "Arithmetic", questionIndex: "WMI" },
  { code: "LETTER_NUMBER_SEQUENCING", label: "Letter-Number Sequencing", questionIndex: "WMI" },
  { code: "SYMBOL_SEARCH", label: "Symbol Search", questionIndex: "PSI" },
  { code: "CODING", label: "Coding", questionIndex: "PSI" },
  { code: "CANCELLATION", label: "Cancellation", questionIndex: "PSI" },
  { code: "MANAJER_KOPERASI_KDMP", label: "Manajer Kopreasi (KDMP)", questionIndex: "SKB" },
  { code: "MANAGER_OPERASIONAL_KNMP", label: "Manager Operesial (KNMP)", questionIndex: "SKB" },
  { code: "KEPALA_PRODUKSI", label: "Kepala Produksi (KNMP)", questionIndex: "SKB" },
  { code: "PENGELOLA_KEUANGAN", label: "Pengelola Keuangan (KNMP)", questionIndex: "SKB" },
  { code: "PENJAMIN_MUTU", label: "Penjamin Mutu (KNMP)", questionIndex: "SKB" },
]

import type { TestConfigResponse, TestType } from "@/lib/api-types"

export const DEFAULT_IQ_TOTAL_QUESTION_COUNT = 130
export const DEFAULT_SKB_QUESTION_COUNT_PER_JABATAN = 50

export function getRuntimeQuestionCount(
  testType: TestType,
  isPaidAccount: boolean,
  config?: TestConfigResponse | null,
): number {
  if (testType === "IQ") {
    return config?.questionCount ?? DEFAULT_IQ_TOTAL_QUESTION_COUNT
  }

  return config?.questionCount ?? DEFAULT_SKB_QUESTION_COUNT_PER_JABATAN
}

export function getIQSectionSummary(config?: TestConfigResponse | null): string {
  const sections = config?.sections ?? []
  if (!sections.length) {
    return "VCI 50 soal, WMI 40 soal, PSI 20 soal, dan PRI 20 soal"
  }

  return sections
    .slice()
    .sort((left, right) => left.orderNo - right.orderNo)
    .map((section) => `${section.questionIndex} ${section.questionCount} soal`)
    .join(", ")
}

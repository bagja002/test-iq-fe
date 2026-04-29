import type { TestType } from "@/lib/api-types"

export const FREE_IQ_QUESTION_LIMIT = 2
export const IQ_QUESTIONS_PER_SECTION = 30
export const IQ_TOTAL_QUESTION_COUNT = IQ_QUESTIONS_PER_SECTION * 4
export const SKB_QUESTION_COUNT_PER_JABATAN = 30

export function getRuntimeQuestionCount(testType: TestType, isPaidAccount: boolean): number {
  if (testType === "IQ") {
    return isPaidAccount ? IQ_TOTAL_QUESTION_COUNT : FREE_IQ_QUESTION_LIMIT
  }

  return SKB_QUESTION_COUNT_PER_JABATAN
}

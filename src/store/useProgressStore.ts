import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuizResult {
  lessonId: string
  score: number
  total: number
  completedAt: string
}

interface ProgressState {
  completedLessonIds: string[]
  quizResults: QuizResult[]
  completeLesson: (lessonId: string) => void
  saveQuizResult: (result: QuizResult) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLessonIds: [],
      quizResults: [],
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),
      saveQuizResult: (result) =>
        set((state) => ({
          quizResults: [...state.quizResults, result],
        })),
    }),
    {
      name: 'space-learn-africa-progress',
      partialize: (state) => ({
        completedLessonIds: state.completedLessonIds,
        quizResults: state.quizResults,
      }),
    },
  ),
)

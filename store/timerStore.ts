import { create } from 'zustand'

export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

interface TimerSettings {
  focusDuration: number      // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number  // minutes
  longBreakInterval: number  // sessions before long break
}

interface TimerStore extends TimerSettings {
  sessionType: SessionType
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number  // seconds
  totalDuration: number  // seconds
  sessionsCompleted: number

  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  skipSession: () => void
  setSessionType: (type: SessionType) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  tickTimer: () => void
  completeSession: () => void
}

function getDurationSeconds(type: SessionType, settings: TimerSettings): number {
  switch (type) {
    case 'focus':      return settings.focusDuration * 60
    case 'shortBreak': return settings.shortBreakDuration * 60
    case 'longBreak':  return settings.longBreakDuration * 60
  }
}

function getNextSessionType(current: SessionType, sessionsCompleted: number, interval: number): SessionType {
  if (current === 'focus') {
    const newCount = sessionsCompleted + 1
    return newCount % interval === 0 ? 'longBreak' : 'shortBreak'
  }
  return 'focus'
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  sessionType: 'focus',
  isRunning: false,
  isPaused: false,
  timeRemaining: DEFAULT_SETTINGS.focusDuration * 60,
  totalDuration: DEFAULT_SETTINGS.focusDuration * 60,
  sessionsCompleted: 0,

  startTimer: () => {
    const state = get()
    const duration = getDurationSeconds(state.sessionType, state)
    set({ isRunning: true, isPaused: false, timeRemaining: duration, totalDuration: duration })
  },

  pauseTimer: () => {
    set({ isRunning: false, isPaused: true })
  },

  resumeTimer: () => {
    set({ isRunning: true, isPaused: false })
  },

  resetTimer: () => {
    const state = get()
    const duration = getDurationSeconds(state.sessionType, state)
    set({ isRunning: false, isPaused: false, timeRemaining: duration, totalDuration: duration })
  },

  skipSession: () => {
    const state = get()
    const nextType = getNextSessionType(state.sessionType, state.sessionsCompleted, state.longBreakInterval)
    const duration = getDurationSeconds(nextType, state)
    const newCount = state.sessionType === 'focus' ? state.sessionsCompleted + 1 : state.sessionsCompleted
    set({
      sessionType: nextType,
      isRunning: false,
      isPaused: false,
      timeRemaining: duration,
      totalDuration: duration,
      sessionsCompleted: newCount,
    })
  },

  setSessionType: (type: SessionType) => {
    const state = get()
    const duration = getDurationSeconds(type, state)
    set({ sessionType: type, isRunning: false, isPaused: false, timeRemaining: duration, totalDuration: duration })
  },

  updateSettings: (settings: Partial<TimerSettings>) => {
    const state = get()
    const merged = { ...state, ...settings }
    const duration = getDurationSeconds(state.sessionType, merged)
    set({ ...settings, timeRemaining: duration, totalDuration: duration, isRunning: false, isPaused: false })
  },

  tickTimer: () => {
    const state = get()
    if (!state.isRunning) return
    if (state.timeRemaining <= 1) {
      get().completeSession()
    } else {
      set({ timeRemaining: state.timeRemaining - 1 })
    }
  },

  completeSession: () => {
    const state = get()
    const newCount = state.sessionType === 'focus' ? state.sessionsCompleted + 1 : state.sessionsCompleted
    const nextType = getNextSessionType(state.sessionType, state.sessionsCompleted, state.longBreakInterval)
    const duration = getDurationSeconds(nextType, state)
    set({
      isRunning: false,
      isPaused: false,
      timeRemaining: 0,
      sessionsCompleted: newCount,
      sessionType: nextType,
      totalDuration: duration,
    })
  },
}))

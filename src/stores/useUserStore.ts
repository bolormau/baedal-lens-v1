import { create } from "zustand"

import type { UserProfile, ToneMode } from "@/types"

type UserState = {
  profile: UserProfile | null
}

type UserActions = {
  setProfile: (profile: UserProfile | null) => void
  updateToneMode: (mode: ToneMode) => void
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),
  updateToneMode: (mode) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, toneMode: mode } : null,
    })),
}))

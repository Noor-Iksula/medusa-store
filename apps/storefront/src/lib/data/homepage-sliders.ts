"use server"

import { sdk } from "@lib/config"

export type HomepageSlider = {
  id: string
  name: string
  image: string | null
  banner_link: string | null
  open_in_new_window: boolean
}

export const getHomepageSliders = async (): Promise<HomepageSlider[]> => {
  return sdk.client
    .fetch<{ sliders: HomepageSlider[]; count: number }>("/store/homepage-sliders", {
      method: "GET",
      cache: "no-store",
    })
    .then(({ sliders }) => sliders || [])
    .catch(() => [])
}
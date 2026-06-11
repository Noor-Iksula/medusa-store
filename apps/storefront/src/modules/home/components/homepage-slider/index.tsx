import { getHomepageSliders } from "@lib/data/homepage-sliders"
import SliderCarousel from "./slider-carousel"

export default async function HomepageSlider() {
  const sliders = await getHomepageSliders()
  if (!sliders.length) return null
  return <SliderCarousel sliders={sliders} />
}
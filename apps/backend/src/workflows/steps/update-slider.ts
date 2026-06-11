import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { HOMEPAGE_SLIDER_MODULE } from "../../modules/homepageSlider"
import HomepageSliderModuleService from "../../modules/homepageSlider/service"

type Input = {
  id: string
  name?: string
  status?: string
  image?: string | null
  banner_link?: string | null
  open_in_new_window?: boolean
}

export const updateSliderStep = createStep(
  "update-slider",
  async (input: Input, { container }) => {
    const sliderService: HomepageSliderModuleService = container.resolve(HOMEPAGE_SLIDER_MODULE)
    const { id, ...data } = input
    const slider = await sliderService.updateSliders({ id, ...data })
    return new StepResponse(slider)
  }
)
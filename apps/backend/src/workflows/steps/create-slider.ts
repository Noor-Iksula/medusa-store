import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { HOMEPAGE_SLIDER_MODULE } from "../../modules/homepageSlider"
import HomepageSliderModuleService from "../../modules/homepageSlider/service"

type Input = {
  name: string
  status: string
  image?: string | null
  banner_link?: string | null
  open_in_new_window: boolean
}

export const createSliderStep = createStep(
  "create-slider",
  async (input: Input, { container }) => {
    const sliderService: HomepageSliderModuleService = container.resolve(HOMEPAGE_SLIDER_MODULE)
    const slider = await sliderService.createSliders(input)
    return new StepResponse(slider, (slider as any).id)
  },
  async (id, { container }) => {
    const sliderService: HomepageSliderModuleService = container.resolve(HOMEPAGE_SLIDER_MODULE)
    await sliderService.deleteSliders(id)
  }
)
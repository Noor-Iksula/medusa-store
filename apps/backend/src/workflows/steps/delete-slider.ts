import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { HOMEPAGE_SLIDER_MODULE } from "../../modules/homepageSlider"
import HomepageSliderModuleService from "../../modules/homepageSlider/service"

export const deleteSliderStep = createStep(
  "delete-slider",
  async ({ id }: { id: string }, { container }) => {
    const sliderService: HomepageSliderModuleService = container.resolve(HOMEPAGE_SLIDER_MODULE)
    await sliderService.deleteSliders(id)
    return new StepResponse({ id })
  }
)
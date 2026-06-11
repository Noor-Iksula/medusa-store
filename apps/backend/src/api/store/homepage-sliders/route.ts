import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_SLIDER_MODULE } from "../../../modules/homepageSlider"
import HomepageSliderModuleService from "../../../modules/homepageSlider/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sliderService: HomepageSliderModuleService = req.scope.resolve(HOMEPAGE_SLIDER_MODULE)
  const [sliders, count] = await sliderService.listAndCountSliders(
    { status: "active" },
    { order: { created_at: "ASC" } }
  )
  res.json({ sliders, count })
}
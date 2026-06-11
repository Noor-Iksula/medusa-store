import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_SLIDER_MODULE } from "../../../modules/homepageSlider"
import HomepageSliderModuleService from "../../../modules/homepageSlider/service"
import { createSliderWorkflow } from "../../../workflows/create-slider"
import { CreateSliderSchema } from "../../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const sliderService: HomepageSliderModuleService = req.scope.resolve(HOMEPAGE_SLIDER_MODULE)
  const [sliders, count] = await sliderService.listAndCountSliders(
    {},
    { order: { created_at: "DESC" } }
  )
  res.json({ sliders, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateSliderSchema>,
  res: MedusaResponse
) {
  const { result } = await createSliderWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ slider: result })
}
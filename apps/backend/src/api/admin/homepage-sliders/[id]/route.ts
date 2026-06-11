import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { HOMEPAGE_SLIDER_MODULE } from "../../../../modules/homepageSlider"
import HomepageSliderModuleService from "../../../../modules/homepageSlider/service"
import { updateSliderWorkflow } from "../../../../workflows/update-slider"
import { deleteSliderWorkflow } from "../../../../workflows/delete-slider"
import { UpdateSliderSchema } from "../../../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const sliderService: HomepageSliderModuleService = req.scope.resolve(HOMEPAGE_SLIDER_MODULE)
  const { id } = req.params

  const slider = await sliderService.retrieveSlider(id).catch(() => null)
  if (!slider) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Slider not found")
  }

  res.json({ slider })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateSliderSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { result } = await updateSliderWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })
  res.json({ slider: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  await deleteSliderWorkflow(req.scope).run({ input: { id } })
  res.json({ id, deleted: true })
}
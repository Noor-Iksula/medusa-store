import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateSliderStep } from "./steps/update-slider"

type Input = {
  id: string
  name?: string
  status?: string
  image?: string | null
  banner_link?: string | null
  open_in_new_window?: boolean
}

export const updateSliderWorkflow = createWorkflow(
  "update-slider",
  function (input: Input) {
    const slider = updateSliderStep(input)
    return new WorkflowResponse(slider)
  }
)
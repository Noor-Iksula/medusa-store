import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createSliderStep } from "./steps/create-slider"

type Input = {
  name: string
  status: string
  image?: string | null
  banner_link?: string | null
  open_in_new_window: boolean
}

export const createSliderWorkflow = createWorkflow(
  "create-slider",
  function (input: Input) {
    const slider = createSliderStep(input)
    return new WorkflowResponse(slider)
  }
)
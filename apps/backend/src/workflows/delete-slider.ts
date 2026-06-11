import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteSliderStep } from "./steps/delete-slider"

export const deleteSliderWorkflow = createWorkflow(
  "delete-slider",
  function (input: { id: string }) {
    const result = deleteSliderStep(input)
    return new WorkflowResponse(result)
  }
)
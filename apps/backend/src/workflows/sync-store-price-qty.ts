import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { syncStorePriceQtyStep } from "./steps/sync-store-price-qty"

export const syncStorePriceQtyWorkflow = createWorkflow(
  "sync-store-price-qty",
  function () {
    const result = syncStorePriceQtyStep()
    return new WorkflowResponse(result)
  }
)

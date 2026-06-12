import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncStorePriceQtyWorkflow } from "../../../../workflows/sync-store-price-qty"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await syncStorePriceQtyWorkflow(req.scope).run()
  res.json({ synced: result.synced })
}

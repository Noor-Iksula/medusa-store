import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_PRICE_AND_QTY_MODULE } from "../../../../modules/storePriceAndQty"
import StorePriceAndQtyModuleService from "../../../../modules/storePriceAndQty/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service: StorePriceAndQtyModuleService = req.scope.resolve(STORE_PRICE_AND_QTY_MODULE)

  const q = (req.query.q as string)?.trim() || ""

  const filter = q
    ? { $or: [{ child_sku: { $ilike: `%${q}%` } }, { store_code: { $ilike: `%${q}%` } }] }
    : {}

  const records = await service.listStorePriceQties(filter, {
    order: { created_at: "DESC" },
  })

  res.json({ records })
}

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_PRICE_AND_QTY_MODULE } from "../../../modules/storePriceAndQty"
import StorePriceAndQtyModuleService from "../../../modules/storePriceAndQty/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service: StorePriceAndQtyModuleService = req.scope.resolve(STORE_PRICE_AND_QTY_MODULE)

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0
  const q = (req.query.q as string)?.trim() || ""

  const filter = q
    ? { $or: [{ child_sku: { $ilike: `%${q}%` } }, { store_code: { $ilike: `%${q}%` } }] }
    : {}

  const [records, count] = await service.listAndCountStorePriceQties(
    filter,
    { order: { created_at: "DESC" }, take: limit, skip: offset }
  )

  res.json({ records, count, limit, offset })
}

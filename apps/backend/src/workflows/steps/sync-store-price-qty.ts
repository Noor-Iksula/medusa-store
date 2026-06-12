import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STORE_PRICE_AND_QTY_MODULE } from "../../modules/storePriceAndQty"
import StorePriceAndQtyModuleService from "../../modules/storePriceAndQty/service"

const API_URL = "https://one.helioswatchstore.com/api/import-stock"
const BATCH_SIZE = 500

export const syncStorePriceQtyStep = createStep(
  "sync-store-price-qty-step",
  async (_, { container }) => {
    const service: StorePriceAndQtyModuleService = container.resolve(STORE_PRICE_AND_QTY_MODULE)

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "User-Agent": "MedusaJS/2.0",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const raw: string[] = await response.json()

    // Parse each row: [store_code, child_sku, quantity, price]
    type Row = { store_code: string; child_sku: string; qty: number; price: number }
    const rows: Row[] = raw.map((item) => {
      const parsed: string[] = JSON.parse(item)
      return {
        store_code: parsed[0] ?? "",
        child_sku: parsed[1] ?? "",
        qty: parseFloat(parsed[2] ?? "0"),
        price: parseFloat(parsed[3] ?? "0"),
      }
    })

    // Aggregate per child_sku: total_quantity and minimum_price
    const skuStats = new Map<string, { totalQty: number; minPrice: number }>()
    for (const row of rows) {
      const existing = skuStats.get(row.child_sku)
      if (existing) {
        existing.totalQty += row.qty
        existing.minPrice = Math.min(existing.minPrice, row.price)
      } else {
        skuStats.set(row.child_sku, { totalQty: row.qty, minPrice: row.price })
      }
    }

    // Delete all existing records
    const existing = await service.listStorePriceQties({}, { select: ["id"] })
    if (existing.length > 0) {
      const ids = existing.map((r) => r.id)
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        await service.deleteStorePriceQties(ids.slice(i, i + BATCH_SIZE))
      }
    }

    // Build records
    const records = rows.map((row) => {
      const stats = skuStats.get(row.child_sku)!
      return {
        store_code: row.store_code,
        child_sku: row.child_sku,
        quantity: Math.round(row.qty),
        status: 0,
        message: null,
        total_quantity: Math.round(stats.totalQty),
        minimum_price: Math.round(stats.minPrice),
      }
    })

    // Batch insert
    let inserted = 0
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      await service.createStorePriceQties(records.slice(i, i + BATCH_SIZE))
      inserted += Math.min(BATCH_SIZE, records.length - i)
    }

    return new StepResponse({ synced: inserted })
  }
)

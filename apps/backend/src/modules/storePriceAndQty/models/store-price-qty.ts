import { model } from "@medusajs/framework/utils"

const StorePriceQty = model.define("store_price_qty", {
  id: model.id().primaryKey(),
  store_code: model.text(),
  child_sku: model.text(),
  quantity: model.number(),
  status: model.number().default(0),
  message: model.text().nullable(),
  total_quantity: model.number(),
  minimum_price: model.number(),
})

export default StorePriceQty

import { MedusaService } from "@medusajs/framework/utils"
import StorePriceQty from "./models/store-price-qty"

class StorePriceAndQtyModuleService extends MedusaService({
  StorePriceQty,
}) {}

export default StorePriceAndQtyModuleService

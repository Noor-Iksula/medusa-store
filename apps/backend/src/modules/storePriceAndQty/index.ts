import { Module } from "@medusajs/framework/utils"
import StorePriceAndQtyModuleService from "./service"

export const STORE_PRICE_AND_QTY_MODULE = "storePriceAndQty"

export default Module(STORE_PRICE_AND_QTY_MODULE, {
  service: StorePriceAndQtyModuleService,
})

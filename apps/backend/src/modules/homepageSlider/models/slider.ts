import { model } from "@medusajs/framework/utils"

const Slider = model.define("homepage_slider", {
  id: model.id().primaryKey(),
  name: model.text(),
  status: model.text().default("active"),
  image: model.text().nullable(),
  banner_link: model.text().nullable(),
  open_in_new_window: model.boolean().default(false),
})

export default Slider
import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

export const CreateSliderSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  image: z.string().nullable().optional(),
  banner_link: z.string().nullable().optional(),
  open_in_new_window: z.boolean().default(false),
})

export const UpdateSliderSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  image: z.string().nullable().optional(),
  banner_link: z.string().nullable().optional(),
  open_in_new_window: z.boolean().optional(),
})

export type CreateSliderSchema = z.infer<typeof CreateSliderSchema>
export type UpdateSliderSchema = z.infer<typeof UpdateSliderSchema>

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/homepage-sliders",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateSliderSchema)],
    },
    {
      matcher: "/admin/homepage-sliders/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateSliderSchema)],
    },
  ],
})
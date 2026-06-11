import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createProductCategoriesWorkflow,
  linkProductsToSalesChannelWorkflow,
} from "@medusajs/core-flows"
import { MedusaContainer } from "@medusajs/framework"
import {
  IFulfillmentModuleService,
  IProductModuleService,
  IRegionModuleService,
  ISalesChannelModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function seed({ container }: { container: MedusaContainer }): Promise<void> {
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)
  const salesChannelService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  // ── Guard: skip if our seed data already exists ────────────────────────────
  const [alreadySeeded] = await productService.listProducts({ title: "Classic White T-Shirt" })
  if (alreadySeeded) {
    console.log("⚠️  Seed data already exists. Skipping.")
    return
  }

  console.log("🌱 Starting seed...")

  // ── Shipping profile ────────────────────────────────────────────────────────
  const [shippingProfile] = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!shippingProfile) {
    throw new Error("No default shipping profile found. Run migrations first.")
  }
  console.log(`✔ Using shipping profile: ${shippingProfile.name}`)

  // ── Sales channel ───────────────────────────────────────────────────────────
  const [existingSalesChannel] = await salesChannelService.listSalesChannels()
  let salesChannelId: string
  if (existingSalesChannel) {
    salesChannelId = existingSalesChannel.id
    console.log(`✔ Using sales channel: ${existingSalesChannel.name}`)
  } else {
    const { result: [newChannel] } = await (createProductsWorkflow as any)(container)
    salesChannelId = newChannel.id
  }

  // ── Regions ─────────────────────────────────────────────────────────────────
  const existingRegions = await regionService.listRegions()
  const hasSupportedRegions = existingRegions.some(r => r.currency_code === "usd")

  if (!hasSupportedRegions) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
          },
        ],
      },
    })
    console.log("✔ Created region: United States (USD)")
  } else {
    console.log(`✔ USD region already exists, skipping`)
  }

  // ── Product categories ───────────────────────────────────────────────────────
  const existingCategories = await productService.listProductCategories()
  const existingCategoryNames = new Set(existingCategories.map(c => c.name))

  const categoriesToCreate = ["Clothing", "Accessories", "Electronics"].filter(
    name => !existingCategoryNames.has(name)
  )

  let categoryMap: Record<string, string> = {}
  existingCategories.forEach(c => { categoryMap[c.name] = c.id })

  if (categoriesToCreate.length > 0) {
    const { result: created } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categoriesToCreate.map(name => ({
          name,
          is_active: true,
        })),
      },
    })
    created.forEach(c => { categoryMap[c.name] = c.id })
    console.log(`✔ Created categories: ${categoriesToCreate.join(", ")}`)
  } else {
    console.log("✔ Categories already exist, skipping")
  }

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = [
    // ── Clothing ───────────────────────────────────────────────────────────────
    {
      title: "Classic White T-Shirt",
      description: "A timeless everyday white tee made from 100% organic cotton. Soft, breathable, and built to last.",
      status: "published" as const,
      category_ids: [categoryMap["Clothing"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map(size => ({
        title: size,
        sku: `tshirt-white-${size.toLowerCase()}`,
        options: { Size: size },
        manage_inventory: true,
        prices: [
          { amount: 19.99, currency_code: "usd" },
          { amount: 18.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
    },
    {
      title: "Slim Fit Jeans",
      description: "Modern slim fit jeans in classic indigo wash. Stretch denim for all-day comfort.",
      status: "published" as const,
      category_ids: [categoryMap["Clothing"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Waist", values: ["30", "32", "34", "36"] }],
      variants: ["30", "32", "34", "36"].map(waist => ({
        title: `W${waist}`,
        sku: `jeans-slim-w${waist}`,
        options: { Waist: waist },
        manage_inventory: true,
        prices: [
          { amount: 49.99, currency_code: "usd" },
          { amount: 46.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    },
    {
      title: "Hooded Sweatshirt",
      description: "A cosy pullover hoodie in a relaxed fit. Kangaroo pocket, adjustable drawstring, fleece lining.",
      status: "published" as const,
      category_ids: [categoryMap["Clothing"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map(size => ({
        title: size,
        sku: `hoodie-${size.toLowerCase()}`,
        options: { Size: size },
        manage_inventory: true,
        prices: [
          { amount: 39.99, currency_code: "usd" },
          { amount: 37.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
    },
    // ── Accessories ────────────────────────────────────────────────────────────
    {
      title: "Leather Bifold Wallet",
      description: "Slim full-grain leather bifold wallet. 6 card slots, 2 cash compartments, RFID blocking.",
      status: "published" as const,
      category_ids: [categoryMap["Accessories"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Color", values: ["Black", "Brown", "Tan"] }],
      variants: ["Black", "Brown", "Tan"].map(color => ({
        title: color,
        sku: `wallet-bifold-${color.toLowerCase()}`,
        options: { Color: color },
        manage_inventory: true,
        prices: [
          { amount: 29.99, currency_code: "usd" },
          { amount: 27.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
    },
    {
      title: "Canvas Tote Bag",
      description: "Large reusable canvas tote with inner zip pocket. Perfect for groceries, gym, beach, or everyday carry.",
      status: "published" as const,
      category_ids: [categoryMap["Accessories"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Color", values: ["Natural", "Navy", "Black"] }],
      variants: ["Natural", "Navy", "Black"].map(color => ({
        title: color,
        sku: `tote-canvas-${color.toLowerCase()}`,
        options: { Color: color },
        manage_inventory: true,
        prices: [
          { amount: 24.99, currency_code: "usd" },
          { amount: 22.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400",
    },
    {
      title: "Snapback Baseball Cap",
      description: "Structured 6-panel snapback cap with flat brim. Embroidered logo, adjustable strap.",
      status: "published" as const,
      category_ids: [categoryMap["Accessories"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Color", values: ["White", "Black", "Grey"] }],
      variants: ["White", "Black", "Grey"].map(color => ({
        title: color,
        sku: `cap-snapback-${color.toLowerCase()}`,
        options: { Color: color },
        manage_inventory: true,
        prices: [
          { amount: 22.99, currency_code: "usd" },
          { amount: 21.49, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
    },
    // ── Electronics ────────────────────────────────────────────────────────────
    {
      title: "Wireless Bluetooth Earbuds",
      description: "True wireless earbuds with active noise cancellation, 28-hour battery life, and IPX5 water resistance.",
      status: "published" as const,
      category_ids: [categoryMap["Electronics"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Color", values: ["White", "Black"] }],
      variants: ["White", "Black"].map(color => ({
        title: color,
        sku: `earbuds-wireless-${color.toLowerCase()}`,
        options: { Color: color },
        manage_inventory: true,
        prices: [
          { amount: 89.99, currency_code: "usd" },
          { amount: 84.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    },
    {
      title: "Portable Phone Stand",
      description: "Adjustable aluminium desk phone stand, compatible with all smartphones. Foldable for travel.",
      status: "published" as const,
      category_ids: [categoryMap["Electronics"]],
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Color", values: ["Silver", "Space Grey"] }],
      variants: ["Silver", "Space Grey"].map(color => ({
        title: color,
        sku: `stand-phone-${color.toLowerCase().replace(" ", "-")}`,
        options: { Color: color },
        manage_inventory: true,
        prices: [
          { amount: 14.99, currency_code: "usd" },
          { amount: 13.99, currency_code: "eur" },
        ],
      })),
      thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
    },
  ]

  console.log(`🛍  Creating ${products.length} products...`)

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: { products },
  })

  console.log(`✔ Created ${createdProducts.length} products`)

  // ── Link all products to the default sales channel ──────────────────────────
  await linkProductsToSalesChannelWorkflow(container).run({
    input: {
      id: salesChannelId,
      add: createdProducts.map(p => p.id),
    },
  })

  console.log(`✔ Linked all products to sales channel`)
  console.log("✅ Seed complete!")
}
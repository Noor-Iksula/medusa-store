import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createProductCategoriesWorkflow,
  linkProductsToSalesChannelWorkflow,
} from "@medusajs/core-flows"
import { MedusaContainer } from "@medusajs/framework"
import {
  IProductModuleService,
  IRegionModuleService,
  ISalesChannelModuleService,
  IFulfillmentModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const BASE_URL = process.env.BACKEND_URL || "http://localhost:9000"
const img = (file: string) => `${BASE_URL}/static/watches/${file}`

// ── Watch catalogue ──────────────────────────────────────────────────────────
const WATCHES = [
  {
    title: "Versace Men HELLENIUM-VK Green Watch",
    brand: "Versace",
    collection: "HELLENIUM-VK",
    sku: "VEVK00620",
    price: 114995,
    gender: "Men",
    description:
      "Premium timepiece featuring quartz movement and sapphire crystal glass with water resistance up to 50m. Stainless steel case and bracelet with a striking green dial.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Green",
    strap: "Stainless Steel Bracelet",
    water_resistance: "50 m",
    image: "vevk00620_1.jpg",
  },
  {
    title: "Cerruti 1881 Men FW23 Black Watch",
    brand: "Cerruti 1881",
    collection: "FW23",
    sku: "CECIWGN0019503W",
    price: 32500,
    gender: "Men",
    description:
      "Premium Italian timepiece featuring quartz movement with sapphire crystal and stainless steel construction, offering timeless elegance with water resistance up to 50m.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Black",
    strap: "Leather",
    water_resistance: "50 m",
    image: "ceciwgn0019503w_1_3.jpg",
  },
  {
    title: "Balmain Men Classic R Brown Watch",
    brand: "Balmain",
    collection: "Classic R",
    sku: "B41083152",
    price: 59400,
    gender: "Men",
    description:
      "Premium Swiss timepiece from the Classic R collection featuring quartz movement and sapphire crystal with elegant stainless steel construction.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Brown",
    strap: "Stainless Steel Bracelet",
    water_resistance: "50 m",
    image: "b41083152_1_3.jpg",
  },
  {
    title: "Citizen Men Automatic Tsuyosa Light Blue Watch",
    brand: "Citizen",
    collection: "Automatic Tsuyosa",
    sku: "NJ0151-88M",
    price: 41900,
    gender: "Men",
    description:
      "Premium Japanese automatic movement with sapphire crystal and 50m water resistance. The iconic Tsuyosa design with a light blue sunray dial.",
    movement: "Automatic",
    case_material: "Stainless Steel",
    dial_color: "Light Blue",
    strap: "Stainless Steel Band Bracelet",
    water_resistance: "50 m",
    image: "nj0151-88m_1_3.jpg",
  },
  {
    title: "Fossil Women Virginia Mother Of Pearl Watch",
    brand: "Fossil",
    collection: "Virginia",
    sku: "ES3716",
    price: 13495,
    gender: "Women",
    description:
      "Elegant quartz timepiece with a luminous mother-of-pearl dial, mineral glass, and stainless steel bracelet. Water resistant up to 50m.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Mother of Pearl",
    strap: "Stainless Steel Bracelet",
    water_resistance: "50 m",
    image: "es3716_1_2_1.jpg",
  },
  {
    title: "G-Shock Men Metal Covered Green Watch",
    brand: "G-Shock",
    collection: "Metal Covered",
    sku: "G1160",
    price: 16995,
    gender: "Men",
    description:
      "Tough quartz watch from Japan with resin and stainless steel construction, durable mineral glass, and outstanding 200m water resistance.",
    movement: "Quartz",
    case_material: "Resin / Stainless Steel",
    dial_color: "Green",
    strap: "Resin Bracelet",
    water_resistance: "200 m",
    image: "g1160_1_2.jpg",
  },
  {
    title: "Casio Unisex Vintage Rectangular Rose Gold Watch",
    brand: "Casio",
    collection: "Vintage",
    sku: "D128",
    price: 5995,
    gender: "Unisex",
    description:
      "Retro rectangular quartz digital watch with a rose gold finish. Lightweight resin case and stainless steel bracelet. Water resistant up to 50m.",
    movement: "Quartz",
    case_material: "Resin",
    dial_color: "Rose Gold",
    strap: "Stainless Steel Bracelet",
    water_resistance: "50 m",
    image: "d128_1_2_1.jpg",
  },
  {
    title: "Swarovski Women Crystalline Aura Rose Gold Watch",
    brand: "Swarovski",
    collection: "Crystalline Aura",
    sku: "5519459",
    price: 40000,
    gender: "Women",
    description:
      "Austrian precision quartz movement with sapphire crystal glass. Rose gold plated case and bracelet adorned with Swarovski crystals.",
    movement: "Quartz",
    case_material: "Rose Gold Plated",
    dial_color: "Rose Gold",
    strap: "Stainless Steel with Push Button Clasp",
    water_resistance: "50 m",
    image: "5519459_1_2_1.jpg",
  },
  {
    title: "Anne Klein Women Diamonds Mother Of Pearl Watch",
    brand: "Anne Klein",
    collection: "Diamonds",
    sku: "AK1980BMRG",
    price: 8800,
    gender: "Women",
    description:
      "Elegant quartz timepiece with a mother-of-pearl dial, genuine diamond hour markers, and a rose gold stainless steel bracelet.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Mother of Pearl",
    strap: "Stainless Steel Bracelet",
    water_resistance: "30 m",
    image: "ak1980bmrg_1_2.jpg",
  },
  {
    title: "Kenneth Cole Men FUN LOVING Grey Watch",
    brand: "Kenneth Cole",
    collection: "FUN LOVING",
    sku: "KCWGL2122303MN",
    price: 19999,
    gender: "Men",
    description:
      "Stylish automatic timepiece with stainless steel construction, mineral glass, and a grey dial. A versatile choice for the modern man.",
    movement: "Automatic",
    case_material: "Stainless Steel",
    dial_color: "Grey",
    strap: "Stainless Steel Bracelet",
    water_resistance: "30 m",
    image: "kcwgl2122303mn_1_2.jpg",
  },
  {
    title: "Michael Kors Women Parker Rose Gold Chronograph Watch",
    brand: "Michael Kors",
    collection: "Parker",
    sku: "MK5896",
    price: 24495,
    gender: "Women",
    description:
      "Chic rose gold chronograph featuring quartz movement, mineral glass, and stainless steel construction. Water resistant up to 50m.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Rose Gold",
    strap: "Stainless Steel Bracelet",
    water_resistance: "50 m",
    image: "mk5896_1_2.jpg",
  },
  {
    title: "Emporio Armani Women GIANNI T-B Grey Watch",
    brand: "Emporio Armani",
    collection: "GIANNI T-B",
    sku: "AR1840",
    price: 26995,
    gender: "Women",
    description:
      "Italian craftsmanship with quartz movement and mineral glass. Bicolour stainless steel bracelet with a sophisticated grey dial.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Grey",
    strap: "Stainless Steel Bracelet (Bicolour)",
    water_resistance: "30 m",
    image: "ar1840_1_3.jpg",
  },
  {
    title: "Armani Exchange Men Outerbanks Black Chronograph Watch",
    brand: "Armani Exchange",
    collection: "Outerbanks",
    sku: "AX1326",
    price: 11495,
    gender: "Men",
    description:
      "Italian quartz chronograph with mineral glass, black dial, and silicone strap. Bold and sporty with 30m water resistance.",
    movement: "Quartz",
    case_material: "Stainless Steel",
    dial_color: "Black",
    strap: "Silicone Strap",
    water_resistance: "30 m",
    image: "ax1326_1_3.jpg",
  },
]

export default async function seedWatches({ container }: { container: MedusaContainer }) {
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)
  const salesChannelService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  // ── Guard: idempotency check ─────────────────────────────────────────────────
  const [alreadySeeded] = await productService.listProducts({ title: WATCHES[0].title })
  if (alreadySeeded) {
    console.log("⚠️  Watch seed data already exists. Skipping.")
    return
  }

  console.log("⌚ Starting watch seed...")

  // ── Shipping profile ─────────────────────────────────────────────────────────
  const [shippingProfile] = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!shippingProfile) throw new Error("No default shipping profile found. Run db:migrate first.")

  // ── Sales channel ────────────────────────────────────────────────────────────
  const [salesChannel] = await salesChannelService.listSalesChannels()
  if (!salesChannel) throw new Error("No sales channel found. Run the main seed first.")
  const salesChannelId = salesChannel.id
  console.log(`✔ Using sales channel: ${salesChannel.name}`)

  // ── India region with INR ────────────────────────────────────────────────────
  const existingRegions = await regionService.listRegions()
  const hasInr = existingRegions.some((r) => r.currency_code === "inr")

  if (!hasInr) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [{ name: "India", currency_code: "inr", countries: ["in"] }],
      },
    })
    console.log("✔ Created region: India (INR)")
  } else {
    console.log("✔ INR region already exists, skipping")
  }

  // ── Product categories ───────────────────────────────────────────────────────
  const existingCats = await productService.listProductCategories()
  const catMap: Record<string, string> = {}
  existingCats.forEach((c) => { catMap[c.name] = c.id })

  const needed = ["Men's Watches", "Women's Watches", "Unisex Watches"].filter(
    (n) => !catMap[n]
  )

  if (needed.length > 0) {
    const { result: created } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: needed.map((name) => ({ name, is_active: true })),
      },
    })
    created.forEach((c) => { catMap[c.name] = c.id })
    console.log(`✔ Created categories: ${needed.join(", ")}`)
  }

  const genderToCategory: Record<string, string> = {
    Men: "Men's Watches",
    Women: "Women's Watches",
    Unisex: "Unisex Watches",
  }

  // ── Create products ──────────────────────────────────────────────────────────
  console.log(`🛍  Creating ${WATCHES.length} watch products...`)

  const products = WATCHES.map((w) => ({
    title: w.title,
    description: w.description,
    status: "published" as const,
    category_ids: [catMap[genderToCategory[w.gender]]].filter(Boolean),
    shipping_profile_id: shippingProfile.id,
    thumbnail: img(w.image),
    images: [{ url: img(w.image) }],
    metadata: {
      brand: w.brand,
      collection: w.collection,
      movement: w.movement,
      case_material: w.case_material,
      dial_color: w.dial_color,
      strap: w.strap,
      water_resistance: w.water_resistance,
      gender: w.gender,
    },
    options: [{ title: "Type", values: ["Standard"] }],
    variants: [
      {
        title: "Standard",
        sku: w.sku,
        options: { Type: "Standard" },
        manage_inventory: false,
        prices: [{ amount: w.price, currency_code: "inr" }],
      },
    ],
  }))

  const { result: created } = await createProductsWorkflow(container).run({
    input: { products },
  })

  console.log(`✔ Created ${created.length} products`)

  // ── Link to sales channel ────────────────────────────────────────────────────
  await linkProductsToSalesChannelWorkflow(container).run({
    input: {
      id: salesChannelId,
      add: created.map((p) => p.id),
    },
  })

  console.log("✔ Linked all watch products to sales channel")
  console.log("✅ Watch seed complete!")
}

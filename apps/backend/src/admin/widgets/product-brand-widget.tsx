import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Container,
  Button,
  Text,
  Label,
  Drawer,
  Select,
  Input,
  toast,
  Badge,
} from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/client"

const BRANDS = [
  "Aigner",
  "Alexander Shorokhoff",
  "Amazfit",
  "Anne Klein",
  "Armani Exchange",
  "Auguste Reymond",
  "Balmain",
  "Baume et Mercier",
  "Boss",
  "Calvin Klein",
  "Casio",
  "Cerruti 1881",
  "Charriol",
  "Citizen",
  "Concord",
  "Daniel Wellington",
  "Diesel",
  "Ducati",
  "Ebel",
  "Edge",
  "Emporio Armani",
  "Ernest Borel",
  "Fitbit",
  "Fossil",
  "Frederique Constant",
  "Garmin",
  "GC",
  "G-Shock",
  "Guess",
  "Herbelin",
  "Just Cavalli",
  "Kenneth Cole",
  "King Seiko",
  "Michael Kors",
  "Milus",
  "Mobvoi",
  "Movado",
  "Nebula",
  "Police",
  "Polar",
  "Rado",
  "Raga",
  "Roberto Cavalli",
  "Roamer",
  "Seiko",
  "Seven Friday",
  "SevenFriday",
  "Swarovski",
  "Tissot",
  "Titan",
  "Titan Edge",
  "Titan Nebula",
  "Titan Raga",
  "Titan Smart",
  "Tommy Hilfiger",
  "U Boat",
  "Versace",
  "Victorinox",
  "Xylys",
].sort((a, b) => a.localeCompare(b))

const MOVEMENTS = [
  "Automatic",
  "Digital",
  "Ecodrive",
  "Mechanical",
  "Quartz",
  "Smart/Digital",
  "Solar",
]

type FormState = {
  brand: string
  collection: string
  movement: string
}

const ProductBrandWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<FormState>({ brand: "", collection: "", movement: "" })

  const meta = product.metadata ?? {}
  const currentBrand = (meta.brand as string) || null
  const currentCollection = (meta.collection as string) || null
  const currentMovement = (meta.movement as string) || null

  const updateMutation = useMutation({
    mutationFn: (values: FormState) =>
      sdk.admin.product.update(product.id, {
        metadata: {
          ...meta,
          brand: values.brand || null,
          collection: values.collection.trim() || null,
          movement: values.movement || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Product attributes updated")
      setDrawerOpen(false)
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update attributes"),
  })

  const handleOpen = () => {
    setForm({
      brand: currentBrand ?? "",
      collection: currentCollection ?? "",
      movement: currentMovement ?? "",
    })
    setDrawerOpen(true)
  }

  return (
    <>
      <Container className="divide-y divide-ui-border-base px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <Text size="small" leading="compact" weight="plus">
            Watch Attributes
          </Text>
          <Button size="small" variant="transparent" onClick={handleOpen}>
            <PencilSquare />
          </Button>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-between py-3">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Brand
          </Text>
          {currentBrand ? (
            <Badge color="blue" size="2xsmall">{currentBrand}</Badge>
          ) : (
            <Text size="small" leading="compact" className="text-ui-fg-muted italic">—</Text>
          )}
        </div>

        {/* Collection */}
        <div className="flex items-center justify-between py-3">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Collection
          </Text>
          {currentCollection ? (
            <Text size="small" leading="compact" weight="plus">
              {currentCollection}
            </Text>
          ) : (
            <Text size="small" leading="compact" className="text-ui-fg-muted italic">—</Text>
          )}
        </div>

        {/* Movement */}
        <div className="flex items-center justify-between pt-3">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Movement
          </Text>
          {currentMovement ? (
            <Badge color="grey" size="2xsmall">{currentMovement}</Badge>
          ) : (
            <Text size="small" leading="compact" className="text-ui-fg-muted italic">—</Text>
          )}
        </div>
      </Container>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Watch Attributes</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="p-6">
            <div className="flex flex-col gap-y-6">

              {/* Brand */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="brand-select">Brand</Label>
                <Select
                  value={form.brand}
                  onValueChange={(v) => setForm({ ...form, brand: v })}
                >
                  <Select.Trigger id="brand-select">
                    <Select.Value placeholder="Select a brand…" />
                  </Select.Trigger>
                  <Select.Content>
                    {BRANDS.map((b) => (
                      <Select.Item key={b} value={b}>{b}</Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {form.brand && (
                  <button
                    type="button"
                    className="self-start text-xs text-ui-fg-muted underline hover:text-ui-fg-base"
                    onClick={() => setForm({ ...form, brand: "" })}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Collection */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="collection-input">Collection</Label>
                <Input
                  id="collection-input"
                  placeholder="e.g. HELLENIUM-VK, Tsuyosa, PRX…"
                  value={form.collection}
                  onChange={(e) => setForm({ ...form, collection: e.target.value })}
                />
              </div>

              {/* Movement */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="movement-select">Movement</Label>
                <Select
                  value={form.movement}
                  onValueChange={(v) => setForm({ ...form, movement: v })}
                >
                  <Select.Trigger id="movement-select">
                    <Select.Value placeholder="Select a movement…" />
                  </Select.Trigger>
                  <Select.Content>
                    {MOVEMENTS.map((m) => (
                      <Select.Item key={m} value={m}>{m}</Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {form.movement && (
                  <button
                    type="button"
                    className="self-start text-xs text-ui-fg-muted underline hover:text-ui-fg-base"
                    onClick={() => setForm({ ...form, movement: "" })}
                  >
                    Clear
                  </button>
                )}
              </div>

            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={updateMutation.isPending}>
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                isLoading={updateMutation.isPending}
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate(form)}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductBrandWidget

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Container,
  Button,
  Text,
  Label,
  Drawer,
  Select,
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
  "Boss",
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

const ProductBrandWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState("")

  const currentBrand = (product.metadata?.brand as string) || null

  const updateMutation = useMutation({
    mutationFn: (brand: string) =>
      sdk.admin.product.update(product.id, {
        metadata: {
          ...product.metadata,
          brand: brand || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Brand updated")
      setDrawerOpen(false)
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update brand"),
  })

  const handleOpen = () => {
    setSelected(currentBrand ?? "")
    setDrawerOpen(true)
  }

  return (
    <>
      <Container className="px-6 py-4 divide-y divide-ui-border-base">
        <div className="flex items-center justify-between pb-3">
          <Text size="small" leading="compact" weight="plus">
            Brand
          </Text>
          <Button size="small" variant="transparent" onClick={handleOpen}>
            <PencilSquare />
          </Button>
        </div>
        <div className="pt-3">
          {currentBrand ? (
            <Badge color="blue" size="2xsmall">
              {currentBrand}
            </Badge>
          ) : (
            <Text size="small" leading="compact" className="text-ui-fg-muted italic">
              No brand set
            </Text>
          )}
        </div>
      </Container>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Brand</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="p-6">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="brand-select">Brand</Label>
              <Select value={selected} onValueChange={setSelected}>
                <Select.Trigger id="brand-select">
                  <Select.Value placeholder="Select a brand…" />
                </Select.Trigger>
                <Select.Content>
                  {BRANDS.map((brand) => (
                    <Select.Item key={brand} value={brand}>
                      {brand}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {selected && (
                <button
                  className="self-start text-xs text-ui-fg-muted underline hover:text-ui-fg-base"
                  onClick={() => setSelected("")}
                  type="button"
                >
                  Clear selection
                </button>
              )}
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
                onClick={() => updateMutation.mutate(selected)}
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

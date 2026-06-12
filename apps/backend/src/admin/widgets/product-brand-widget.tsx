import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Container,
  Button,
  Text,
  Input,
  Label,
  Drawer,
  toast,
  Badge,
} from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/client"

const ProductBrandWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [brandInput, setBrandInput] = useState("")

  const currentBrand = (product.metadata?.brand as string) || null

  const updateMutation = useMutation({
    mutationFn: (brand: string) =>
      sdk.admin.product.update(product.id, {
        metadata: {
          ...product.metadata,
          brand: brand.trim() || null,
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
    setBrandInput(currentBrand ?? "")
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
              <Label htmlFor="brand-input">Brand Name</Label>
              <Input
                id="brand-input"
                placeholder="e.g. Versace, Casio, Citizen…"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !updateMutation.isPending) {
                    updateMutation.mutate(brandInput)
                  }
                }}
                autoFocus
              />
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Stored in product metadata. Leave empty to remove.
              </Text>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                isLoading={updateMutation.isPending}
                onClick={() => updateMutation.mutate(brandInput)}
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

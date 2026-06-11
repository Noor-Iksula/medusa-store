import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Badge,
  Text,
  Input,
  Label,
  Switch,
  toast,
  Skeleton,
  FocusModal,
  Drawer,
} from "@medusajs/ui"
import { Photo, PencilSquare, Trash } from "@medusajs/icons"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

// ── Types ──────────────────────────────────────────────────────────────────────
type Slider = {
  id: string
  name: string
  status: string
  image: string | null
  banner_link: string | null
  open_in_new_window: boolean
  created_at: string
}

type SliderFormData = {
  name: string
  status: "active" | "inactive"
  image: string
  banner_link: string
  open_in_new_window: boolean
}

const defaultForm: SliderFormData = {
  name: "",
  status: "active",
  image: "",
  banner_link: "",
  open_in_new_window: false,
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const HomepageSlidersPage = () => {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSlider, setEditSlider] = useState<Slider | null>(null)
  const [createForm, setCreateForm] = useState<SliderFormData>(defaultForm)
  const [editForm, setEditForm] = useState<SliderFormData>(defaultForm)
  const [errors, setErrors] = useState<Partial<SliderFormData>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["homepage-sliders"],
    queryFn: () => sdk.client.fetch<{ sliders: Slider[]; count: number }>("/admin/homepage-sliders"),
  })

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: SliderFormData) =>
      sdk.client.fetch("/admin/homepage-sliders", {
        method: "POST",
        body: {
          ...body,
          image: body.image || null,
          banner_link: body.banner_link || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sliders"] })
      toast.success("Slider created")
      setCreateOpen(false)
      setCreateForm(defaultForm)
      setErrors({})
    },
    onError: (e: any) => toast.error(e?.message || "Failed to create slider"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: SliderFormData & { id: string }) =>
      sdk.client.fetch(`/admin/homepage-sliders/${id}`, {
        method: "POST",
        body: {
          ...body,
          image: body.image || null,
          banner_link: body.banner_link || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sliders"] })
      toast.success("Slider updated")
      setEditSlider(null)
      setErrors({})
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update slider"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/homepage-sliders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sliders"] })
      toast.success("Slider deleted")
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete slider"),
  })

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: "active" | "inactive" }) => {
      await Promise.all(
        ids.map((id) =>
          sdk.client.fetch(`/admin/homepage-sliders/${id}`, {
            method: "POST",
            body: { status },
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sliders"] })
      toast.success("Sliders updated")
      setSelectedIds(new Set())
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update sliders"),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          sdk.client.fetch(`/admin/homepage-sliders/${id}`, { method: "DELETE" })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sliders"] })
      toast.success("Sliders deleted")
      setSelectedIds(new Set())
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete sliders"),
  })

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (form: SliderFormData) => {
    const errs: Partial<SliderFormData> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    return errs
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    const errs = validate(createForm)
    if (Object.keys(errs).length) { setErrors(errs); return }
    createMutation.mutate(createForm)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === sliders.length && sliders.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sliders.map((s) => s.id)))
    }
  }

  const handleEdit = (slider: Slider) => {
    setEditSlider(slider)
    setEditForm({
      name: slider.name,
      status: slider.status as "active" | "inactive",
      image: slider.image || "",
      banner_link: slider.banner_link || "",
      open_in_new_window: slider.open_in_new_window,
    })
    setErrors({})
  }

  const handleUpdate = () => {
    if (!editSlider) return
    const errs = validate(editForm)
    if (Object.keys(errs).length) { setErrors(errs); return }
    updateMutation.mutate({ id: editSlider.id, ...editForm })
  }

  const handleExport = () => {
    const headers = ["ID", "Name", "Status", "Image", "Banner Link", "Open in New Window", "Created At"]
    const rows = sorted.map((s) => [
      s.id,
      s.name,
      s.status,
      s.image ?? "",
      s.banner_link ?? "",
      s.open_in_new_window ? "Yes" : "No",
      new Date(s.created_at).toLocaleString(),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `homepage-sliders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sliders = data?.sliders || []

  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = [...sliders].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey as keyof Slider] ?? ""
    const bVal = b[sortKey as keyof Slider] ?? ""
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" })
    return sortDir === "asc" ? cmp : -cmp
  })

  const columns: { label: string; key: string | null }[] = [
    { label: "ID", key: "id" },
    { label: "Image", key: null },
    { label: "Name", key: "name" },
    { label: "Banner Link", key: "banner_link" },
    { label: "New Window", key: "open_in_new_window" },
    { label: "Status", key: "status" },
    { label: "Actions", key: null },
  ]

  return (
    <div className="flex flex-col gap-y-4 p-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Homepage Sliders</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Manage banner sliders displayed on the homepage
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleExport}
            disabled={sliders.length === 0}
          >
            Export CSV
          </Button>
          <Button size="small" onClick={() => { setCreateForm(defaultForm); setErrors({}); setCreateOpen(true) }}>
            Add Slider
          </Button>
        </div>
      </div>

      {/* ── Bulk Action Bar ────────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-x-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2">
          <Text size="small" leading="compact" weight="plus">
            {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
          </Text>
          <div className="flex items-center gap-x-2 ml-auto">
            <Button
              size="small"
              variant="secondary"
              disabled={bulkStatusMutation.isPending || bulkDeleteMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: Array.from(selectedIds), status: "active" })}
            >
              Set Active
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={bulkStatusMutation.isPending || bulkDeleteMutation.isPending}
              onClick={() => bulkStatusMutation.mutate({ ids: Array.from(selectedIds), status: "inactive" })}
            >
              Set Inactive
            </Button>
            <Button
              size="small"
              variant="danger"
              disabled={bulkStatusMutation.isPending || bulkDeleteMutation.isPending}
              isLoading={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
            >
              Delete Selected
            </Button>
            <Button
              size="small"
              variant="transparent"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <Container className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col gap-y-2 p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : sliders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-y-2 p-12">
            <Photo className="text-ui-fg-muted" />
            <Text size="small" className="text-ui-fg-subtle">
              No sliders yet. Click "Add Slider" to create one.
            </Text>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-ui-border-base">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="accent-ui-fg-interactive cursor-pointer"
                    checked={selectedIds.size === sliders.length && sliders.length > 0}
                    ref={(el) => {
                      if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < sliders.length
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
                {columns.map(({ label, key }) => (
                  <th
                    key={label}
                    className={`px-6 py-3 ${key ? "cursor-pointer select-none hover:bg-ui-bg-subtle" : ""}`}
                    onClick={key ? () => handleSort(key) : undefined}
                  >
                    <div className="flex items-center gap-x-1">
                      <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
                        {label}
                      </Text>
                      {key && (
                        <span className="text-xs text-ui-fg-muted">
                          {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((slider) => (
                <tr
                  key={slider.id}
                  className={`border-b border-ui-border-base last:border-0 hover:bg-ui-bg-subtle transition-colors ${selectedIds.has(slider.id) ? "bg-ui-bg-highlight" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="accent-ui-fg-interactive cursor-pointer"
                      checked={selectedIds.has(slider.id)}
                      onChange={() => toggleSelect(slider.id)}
                    />
                  </td>
                  <td className="px-6 py-3 max-w-[140px]">
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-muted truncate block font-mono"
                      title={slider.id}
                    >
                      {slider.id}
                    </Text>
                  </td>
                  <td className="px-6 py-3">
                    {slider.image ? (
                      <img
                        src={slider.image}
                        alt={slider.name}
                        className="h-10 w-16 rounded object-cover border border-ui-border-base"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded border border-ui-border-base bg-ui-bg-subtle">
                        <Photo className="text-ui-fg-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Text size="small" leading="compact" weight="plus">{slider.name}</Text>
                  </td>
                  <td className="px-6 py-3 max-w-xs">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle truncate">
                      {slider.banner_link || "—"}
                    </Text>
                  </td>
                  <td className="px-6 py-3">
                    <Badge color={slider.open_in_new_window ? "blue" : "grey"} size="2xsmall">
                      {slider.open_in_new_window ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Badge color={slider.status === "active" ? "green" : "grey"} size="2xsmall">
                      {slider.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-x-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleEdit(slider)}
                      >
                        <PencilSquare />
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => deleteMutation.mutate(slider.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Container>

      {/* ── Create FocusModal ──────────────────────────────────────────────── */}
      <FocusModal open={createOpen} onOpenChange={setCreateOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary" disabled={createMutation.isPending}>
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button size="small" onClick={handleCreate} isLoading={createMutation.isPending}>
                  Create Slider
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-xl py-8 px-4 flex flex-col gap-y-6">
                <Heading level="h2">New Homepage Slider</Heading>
                <SliderForm form={createForm} setForm={setCreateForm} errors={errors} setErrors={setErrors} />
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      {/* ── Edit Drawer ────────────────────────────────────────────────────── */}
      <Drawer open={!!editSlider} onOpenChange={(open) => { if (!open) setEditSlider(null) }}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Slider</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-6">
            <SliderForm form={editForm} setForm={setEditForm} errors={errors} setErrors={setErrors} />
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={updateMutation.isPending}>
                  Cancel
                </Button>
              </Drawer.Close>
              <Button size="small" onClick={handleUpdate} isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

// ── Shared Form Component ──────────────────────────────────────────────────────
const SliderForm = ({
  form,
  setForm,
  errors,
  setErrors,
}: {
  form: SliderFormData
  setForm: (f: SliderFormData) => void
  errors: Partial<SliderFormData>
  setErrors: (e: Partial<SliderFormData>) => void
}) => {
  const [uploading, setUploading] = useState(false)

  const field = (key: keyof SliderFormData, value: string) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: undefined })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const res = await fetch("/admin/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      const data: { files: { id: string; url: string }[] } = await res.json()
      const url = data.files?.[0]?.url
      if (url) setForm({ ...form, image: url })
      else toast.error("Upload succeeded but no URL returned")
    } catch {
      toast.error("Image upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-y-5">
      {/* Name */}
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Summer Sale Banner"
          value={form.name}
          onChange={(e) => field("name", e.target.value)}
        />
        {errors.name && (
          <Text size="small" className="text-ui-fg-error">{errors.name}</Text>
        )}
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-y-2">
        <Label>Image</Label>
        {form.image ? (
          <div className="relative">
            <img
              src={form.image}
              alt="Preview"
              className="h-36 w-full rounded object-cover border border-ui-border-base"
            />
            <Button
              size="small"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => setForm({ ...form, image: "" })}
            >
              Remove
            </Button>
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center gap-y-2 rounded border-2 border-dashed border-ui-border-base p-8 cursor-pointer transition-colors hover:bg-ui-bg-subtle ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Photo className="text-ui-fg-muted" />
            <Text size="small" className="text-ui-fg-subtle">
              {uploading ? "Uploading..." : "Click to upload image"}
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              PNG, JPG, GIF, WEBP
            </Text>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Banner Link */}
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="banner_link">Banner Link</Label>
        <Input
          id="banner_link"
          placeholder="https://example.com/sale"
          value={form.banner_link}
          onChange={(e) => field("banner_link", e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-y-2">
        <Label>Status</Label>
        <div className="flex gap-x-3">
          {(["active", "inactive"] as const).map((s) => (
            <label key={s} className="flex items-center gap-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={form.status === s}
                onChange={() => setForm({ ...form, status: s })}
                className="accent-ui-fg-interactive"
              />
              <Text size="small" leading="compact" className="capitalize">{s}</Text>
            </label>
          ))}
        </div>
      </div>

      {/* Open in new window */}
      <div className="flex items-center justify-between rounded-md border border-ui-border-base px-4 py-3">
        <div className="flex flex-col gap-y-0.5">
          <Text size="small" leading="compact" weight="plus">Open in New Window</Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Link opens in a new browser tab when clicked
          </Text>
        </div>
        <Switch
          checked={form.open_in_new_window}
          onCheckedChange={(checked) => setForm({ ...form, open_in_new_window: checked })}
        />
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Homepage Sliders",
})

export default HomepageSlidersPage
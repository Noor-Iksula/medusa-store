import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Text,
  Badge,
  Skeleton,
  toast,
} from "@medusajs/ui"
import { ArrowPath, ChevronLeft, ChevronRight, MagnifyingGlass, XCircle } from "@medusajs/icons"
import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

const PAGE_SIZE = 20

type StorePriceQty = {
  id: string
  store_code: string
  child_sku: string
  quantity: number
  status: number
  message: string | null
  total_quantity: number
  minimum_price: number
  created_at: string
  updated_at: string
}

type SortKey = keyof StorePriceQty

const StorePriceQtyPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const offset = (page - 1) * PAGE_SIZE

  // Debounce search input — fires 400ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const queryString = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    ...(search ? { q: search } : {}),
  }).toString()

  const { data, isLoading } = useQuery({
    queryKey: ["store-price-qty", page, search],
    queryFn: () =>
      sdk.client.fetch<{ records: StorePriceQty[]; count: number }>(
        `/admin/store-price-qty?${queryString}`
      ),
    placeholderData: (prev) => prev,
  })

  const syncMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ synced: number }>("/admin/store-price-qty/sync", {
        method: "POST",
      }),
    onSuccess: (res) => {
      setPage(1)
      queryClient.invalidateQueries({ queryKey: ["store-price-qty"] })
      toast.success(`Synced ${res.synced.toLocaleString()} records from API`)
    },
    onError: (e: any) => toast.error(e?.message || "Sync failed"),
  })

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const qs = search ? `?q=${encodeURIComponent(search)}` : ""
      const res = await sdk.client.fetch<{ records: StorePriceQty[] }>(
        `/admin/store-price-qty/export${qs}`
      )

      const headers = [
        "Store Code",
        "Child SKU",
        "Quantity",
        "Total Quantity",
        "Minimum Price",
        "Status",
        "Message",
        "Created At",
        "Updated At",
      ]

      const rows = res.records.map((r) => [
        r.store_code,
        r.child_sku,
        r.quantity,
        r.total_quantity,
        r.minimum_price,
        r.status,
        r.message ?? "",
        new Date(r.created_at).toLocaleString(),
        new Date(r.updated_at).toLocaleString(),
      ])

      const csv = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const suffix = search ? `-${search}` : ""
      link.download = `store-price-qty${suffix}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${res.records.length.toLocaleString()} records`)
    } catch (e: any) {
      toast.error(e?.message || "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const records = data?.records ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const sorted = [...records].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey] ?? ""
    const bVal = b[sortKey] ?? ""
    const cmp =
      typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" })
    return sortDir === "asc" ? cmp : -cmp
  })

  type Column = { label: string; key: SortKey | null }
  const columns: Column[] = [
    { label: "Store Code", key: "store_code" },
    { label: "Child SKU", key: "child_sku" },
    { label: "Qty", key: "quantity" },
    { label: "Total Qty", key: "total_quantity" },
    { label: "Min Price", key: "minimum_price" },
    { label: "Status", key: "status" },
    { label: "Message", key: "message" },
    { label: "Synced At", key: "created_at" },
  ]

  return (
    <div className="flex flex-col gap-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Store Price &amp; Qty</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading
              ? "Loading…"
              : search
              ? `${totalCount.toLocaleString()} result${totalCount !== 1 ? "s" : ""} for "${search}"`
              : `${totalCount.toLocaleString()} total records`}
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || totalCount === 0}
            isLoading={exporting}
          >
            {exporting ? "Exporting…" : `Export CSV${search ? " (filtered)" : ""}`}
          </Button>
          <Button
            size="small"
            isLoading={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <ArrowPath />
            {syncMutation.isPending ? "Syncing…" : "Sync from API"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
        <input
          type="text"
          placeholder="Search by child SKU or store code…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-ui-border-base bg-ui-bg-field py-1.5 pl-9 pr-8 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(""); setSearch(""); setPage(1) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base"
          >
            <XCircle />
          </button>
        )}
      </div>

      {/* Grid */}
      <Container className="p-0 overflow-hidden">
        {isLoading && records.length === 0 ? (
          <div className="flex flex-col gap-y-2 p-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-y-3 p-16">
            <ArrowPath className="text-ui-fg-muted" />
            <Text size="small" className="text-ui-fg-subtle">
              No data yet. Click "Sync from API" to fetch records.
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              Note: First sync imports ~245,000 records and may take a minute.
            </Text>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ui-border-base bg-ui-bg-subtle">
                  <tr>
                    {columns.map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-4 py-3 whitespace-nowrap ${key ? "cursor-pointer select-none hover:bg-ui-bg-base" : ""}`}
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
                  {sorted.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-ui-border-base last:border-0 hover:bg-ui-bg-subtle transition-colors"
                    >
                      <td className="px-4 py-2">
                        <Badge size="2xsmall" color="blue">{row.store_code}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Text size="small" leading="compact" weight="plus">
                          {row.child_sku}
                        </Text>
                      </td>
                      <td className="px-4 py-2">
                        <Text size="small" leading="compact">
                          {row.quantity.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-4 py-2">
                        <Text size="small" leading="compact">
                          {row.total_quantity.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-4 py-2">
                        <Text size="small" leading="compact">
                          {row.minimum_price.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          size="2xsmall"
                          color={row.status === 1 ? "green" : "grey"}
                        >
                          {row.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Text size="small" leading="compact" className="text-ui-fg-muted">
                          {row.message ?? "—"}
                        </Text>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Text size="small" leading="compact" className="text-ui-fg-muted">
                          {new Date(row.created_at).toLocaleString()}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-ui-border-base px-4 py-3">
              <Text size="small" className="text-ui-fg-subtle">
                Page {page} of {totalPages} &nbsp;·&nbsp;{" "}
                {Math.min(offset + 1, totalCount).toLocaleString()}–
                {Math.min(offset + PAGE_SIZE, totalCount).toLocaleString()} of{" "}
                {totalCount.toLocaleString()} records
              </Text>
              <div className="flex items-center gap-x-1">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage(1)}
                >
                  «
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft />
                </Button>

                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                  const p = start + i
                  return (
                    <Button
                      key={p}
                      size="small"
                      variant={p === page ? "primary" : "secondary"}
                      disabled={isLoading}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                })}

                <Button
                  size="small"
                  variant="secondary"
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight />
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Store Price & Qty",
})

export default StorePriceQtyPage

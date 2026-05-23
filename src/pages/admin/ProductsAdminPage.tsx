import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, SlidersHorizontal, ImageOff } from 'lucide-react'
import { productsApi } from '@/api/products'
import { useCategories } from '@/hooks/useProducts'
import { useUiStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import type { Resolver } from 'react-hook-form'
import type { Product } from '@/types'

// ── Schemas ──────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name:            z.string().min(1, { message: 'Name is required' }),
  description:     z.string().min(1, { message: 'Description is required' }),
  priceUsd:        z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  categoryId:      z.string().min(1, 'Category is required'),
  brand:           z.string().optional(),
  sku:             z.string().optional(),
  initialStock:    z.coerce.number().min(0).default(0),
})
type ProductForm = z.infer<typeof productSchema>

const inventorySchema = z.object({
  quantity: z.coerce.number().int('Must be a whole number').refine((v) => v !== 0, 'Cannot be zero'),
  reason:   z.string().optional(),
})
type InventoryForm = z.infer<typeof inventorySchema>

// ── Component ─────────────────────────────────────────────────────────────────
export function AdminProductsPage() {
  const qc = useQueryClient()
  const { toast } = useUiStore()
  const { data: categories = [] } = useCategories()

  const [page, setPage] = useState(1)
  const [productModal, setProductModal] = useState<{ open: boolean; editing?: Product }>({ open: false })
  const [inventoryModal, setInventoryModal] = useState<{ open: boolean; productId?: string; productName?: string }>({ open: false })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productsApi.getProducts({ page, limit: 10 }),
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-products'] })

  const createMut = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => { invalidate(); toast.success('Product created'); setProductModal({ open: false }) },
    onError: () => toast.error('Failed to create product'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof productsApi.updateProduct>[1] }) =>
      productsApi.updateProduct(id, dto),
    onSuccess: () => { invalidate(); toast.success('Product updated'); setProductModal({ open: false }) },
    onError: () => toast.error('Failed to update product'),
  })
  const deleteMut = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => { invalidate(); toast.success('Product deactivated'); setDeleteId(null) },
    onError: () => toast.error('Failed to deactivate product'),
  })
  const adjustMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { quantity: number; reason?: string } }) =>
      productsApi.adjustInventory(id, dto),
    onSuccess: () => { toast.success('Inventory adjusted'); setInventoryModal({ open: false }) },
    onError: () => toast.error('Failed to adjust inventory'),
  })

  // ── Product form ──────────────────────────────────────────────────────────
  const pForm = useForm<ProductForm>({ resolver: zodResolver(productSchema) as Resolver<ProductForm> })

  useEffect(() => {
    if (productModal.editing) {
      const p = productModal.editing
      pForm.reset({
        name: p.name, description: p.description,
        priceUsd: p.priceInCents / 100, discountPercent: p.discountPercent,
        categoryId: p.category.id, brand: p.brand ?? '', sku: p.sku ?? '',
        initialStock: 0,
      })
    } else {
      pForm.reset({ discountPercent: 0, initialStock: 0 })
    }
  }, [productModal, pForm])

  async function onProductSubmit(data: ProductForm) {
    const dto = {
      name: data.name, description: data.description,
      priceInCents: Math.round(data.priceUsd * 100),
      discountPercent: data.discountPercent,
      categoryId: data.categoryId, brand: data.brand || undefined,
      sku: data.sku || undefined, initialStock: data.initialStock,
    }
    if (productModal.editing) {
      await updateMut.mutateAsync({ id: productModal.editing.id, dto })
    } else {
      await createMut.mutateAsync(dto)
    }
  }

  // ── Inventory form ────────────────────────────────────────────────────────
  const iForm = useForm<InventoryForm>({ resolver: zodResolver(inventorySchema) as Resolver<InventoryForm> })
  async function onInventorySubmit(data: InventoryForm) {
    if (!inventoryModal.productId) return
    await adjustMut.mutateAsync({ id: inventoryModal.productId, dto: { quantity: data.quantity, reason: data.reason } })
    iForm.reset()
  }

  const totalPages = data ? Math.ceil(data.total / 10) : 0
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">Products</h1>
          {data && <p className="text-text-dim text-sm mt-1">{data.total} total</p>}
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={() => setProductModal({ open: true })}>
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !data?.data.length ? (
          <p className="text-text-dim text-sm text-center py-12">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'Category', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.map((product) => {
                  const img = product.images.find((i) => i.isPrimary) ?? product.images[0]
                  return (
                    <tr key={product.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img.url} alt="" className="size-10 rounded object-cover bg-surface-2 shrink-0" />
                          ) : (
                            <div className="size-10 rounded bg-surface-2 flex items-center justify-center shrink-0">
                              <ImageOff className="size-4 text-text-dim" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-text">{product.name}</p>
                            {product.brand && <p className="text-xs text-text-dim">{product.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="default">{product.category.name}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <PriceDisplay
                          finalPriceInCents={Math.round(
                            product.priceInCents * (1 - (product.discountPercent ?? 0) / 100),
                          )}
                          originalPriceInCents={product.discountPercent > 0 ? product.priceInCents : undefined}
                          discountPercent={product.discountPercent > 0 ? product.discountPercent : undefined}
                          size="sm"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={product.isActive ? 'success' : 'error'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setInventoryModal({ open: true, productId: product.id, productName: product.name })}
                            title="Adjust inventory"
                            className="p-1.5 text-text-dim hover:text-cyan hover:bg-cyan-dim rounded transition-colors"
                          >
                            <SlidersHorizontal className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setProductModal({ open: true, editing: product })}
                            title="Edit"
                            className="p-1.5 text-text-dim hover:text-text hover:bg-surface-2 rounded transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            title="Deactivate"
                            className="p-1.5 text-text-dim hover:text-coral hover:bg-coral-dim rounded transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <span className="flex items-center px-3 text-sm text-text-muted">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}

      {/* Product create/edit modal */}
      <Modal
        isOpen={productModal.open}
        onClose={() => setProductModal({ open: false })}
        title={productModal.editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={pForm.handleSubmit(onProductSubmit)} className="space-y-4">
          <Input label="Name" error={pForm.formState.errors.name?.message} {...pForm.register('name')} />
          <Textarea label="Description" error={pForm.formState.errors.description?.message} {...pForm.register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (USD)" type="number" step="0.01" error={pForm.formState.errors.priceUsd?.message} {...pForm.register('priceUsd')} />
            <Input label="Discount %" type="number" error={pForm.formState.errors.discountPercent?.message} {...pForm.register('discountPercent')} />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category…"
            error={pForm.formState.errors.categoryId?.message}
            {...pForm.register('categoryId')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand" error={pForm.formState.errors.brand?.message} {...pForm.register('brand')} />
            <Input label="SKU" error={pForm.formState.errors.sku?.message} {...pForm.register('sku')} />
          </div>
          {!productModal.editing && (
            <Input label="Initial Stock" type="number" error={pForm.formState.errors.initialStock?.message} {...pForm.register('initialStock')} />
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setProductModal({ open: false })} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={createMut.isPending || updateMut.isPending} className="flex-1">
              {productModal.editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inventory modal */}
      <Modal
        isOpen={inventoryModal.open}
        onClose={() => { setInventoryModal({ open: false }); iForm.reset() }}
        title={`Adjust Inventory`}
        size="sm"
      >
        {inventoryModal.productName && (
          <p className="text-sm text-text-muted mb-4">{inventoryModal.productName}</p>
        )}
        <form onSubmit={iForm.handleSubmit(onInventorySubmit)} className="space-y-4">
          <Input
            label="Quantity (+ to add, − to subtract)"
            type="number"
            placeholder="e.g. 10 or -5"
            error={iForm.formState.errors.quantity?.message}
            {...iForm.register('quantity')}
          />
          <Input label="Reason (optional)" {...iForm.register('reason')} />
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setInventoryModal({ open: false })} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={adjustMut.isPending} className="flex-1">Adjust</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Deactivate Product" size="sm">
        <p className="text-sm text-text-muted mb-5">This will deactivate the product. It won't appear in the store.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            isLoading={deleteMut.isPending}
            onClick={() => deleteId && deleteMut.mutate(deleteId)}
            className="flex-1"
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import { formatDateTimeIN } from '../../lib/dashboardUtils';
import { resolveMediaUrl } from '../../lib/mediaAssets';
import { BottleVolume, CategoryRecord, Product } from '../../types';
import { ImageUploaderField } from '../../components/ImageUploaderField';
import { AdminOverviewData } from './AdminTypes';

interface CatalogProps {
  data: AdminOverviewData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

// ── 1. PRODUCTS MANAGEMENT ─────────────────────────────────────────────────────
export const AdminProductsView: React.FC<CatalogProps> = ({ data, onRefresh, onNotify }) => {
  const { products, categories } = data;
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openNewModal = () => {
    setIsNew(true);
    setEditing({
      name: '',
      subtitle: 'Signature Extrait de Parfum',
      category: categories[0]?.name || 'Floral',
      concentration: 'Eau de Parfum',
      shortDescription: '',
      description: '',
      image: 'asset:velora-enchanted-mirage',
      gallery: ['asset:velora-enchanted-mirage', 'asset:velora-radiant-elixir'],
      featured: false,
      inCollectionCarousel: true,
      published: true,
      tag: 'Atelier Edition',
      longevity: '8 – 10 Hours',
      sillage: 'Moderate to Strong',
      origin: 'Grasse & Kannauj',
      notes: { top: ['Bergamot'], heart: ['Damascus Rose'], base: ['Mysore Sandalwood'] },
      volumes: [
        { volume: '30ml', price: 1499, originalPrice: 1799 },
        { volume: '50ml', price: 2499, originalPrice: 2999 },
        { volume: '100ml', price: 3799, originalPrice: 4399 },
      ],
      stock: { '30ml': 25, '50ml': 30, '100ml': 15 },
      lowStockThreshold: 10,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const endpoint = isNew ? '/api/admin/products' : `/api/admin/products/${editing.id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editing),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save fragrance.');
      await onRefresh();
      onNotify(isNew ? 'Fragrance added to live catalog.' : 'Fragrance updated.');
      setEditing(null);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prod: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed.');
      await onRefresh();
      onNotify(`${prod.name} deleted.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  };

  const togglePublished = async (prod: Product) => {
    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !prod.published }),
      });
      await onRefresh();
      onNotify(`${prod.name} is now ${!prod.published ? 'Published' : 'Hidden'}.`);
    } catch {
      onNotify('Unable to toggle visibility.');
    }
  };

  const updateVolumePrice = (
    vol: BottleVolume,
    field: 'price' | 'originalPrice',
    val: number
  ) => {
    if (!editing) return;
    const nextVols = (editing.volumes || []).map((v) =>
      v.volume === vol ? { ...v, [field]: val > 0 ? val : undefined } : v
    );
    setEditing({ ...editing, volumes: nextVols });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E6DDD1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex items-center border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[42px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E655E] mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrance name, category, notes..."
            className="bg-transparent text-sm w-full focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs uppercase tracking-[0.14em]"
        >
          <Plus className="w-4 h-4" />
          Add New Perfume
        </button>
      </div>

      <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">30ml / 50ml / 100ml</th>
              <th className="py-3.5 px-4">Total Stock</th>
              <th className="py-3.5 px-4">Storefront</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDD1]">
            {filtered.map((prod) => {
              const totalStock =
                (prod.stock?.['30ml'] ?? 0) +
                (prod.stock?.['50ml'] ?? 0) +
                (prod.stock?.['100ml'] ?? 0);
              return (
                <tr key={prod.id} className="hover:bg-[#FAF8F4]/60">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(prod.image)}
                        alt={prod.name}
                        className="w-12 h-14 object-cover bg-[#F2ECE4] border border-[#E6DDD1] shrink-0"
                      />
                      <div>
                        <p className="font-serif text-lg text-[#181614]">{prod.name}</p>
                        <p className="text-xs text-[#6E655E]">{prod.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="block font-medium text-[#181614]">{prod.category}</span>
                    <span className="text-[#6E655E]">{prod.concentration}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs tabular-nums">
                    {prod.volumes.map((v) => (
                      <span key={v.volume} className="block">
                        {v.volume}: <strong>{formatINR(v.price)}</strong>
                      </span>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 text-xs tabular-nums">
                    <span className="font-semibold text-[#181614] block">{totalStock} bottles</span>
                    <span className="text-[#6E655E]">
                      30ml:{prod.stock?.['30ml'] ?? 0} · 50ml:{prod.stock?.['50ml'] ?? 0} · 100ml:
                      {prod.stock?.['100ml'] ?? 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => togglePublished(prod)}
                      className={`px-2.5 py-1 text-[11px] border ${
                        prod.published !== false
                          ? 'bg-[#EDF5EF] text-[#1F5D37] border-[#C5DFCC]'
                          : 'bg-[#F2ECE4] text-[#6E655E] border-[#E6DDD1]'
                      }`}
                    >
                      {prod.published !== false ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNew(false);
                          setEditing(JSON.parse(JSON.stringify(prod)));
                        }}
                        aria-label={`Edit ${prod.name}`}
                        className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] hover:border-[#181614]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prod)}
                        aria-label={`Delete ${prod.name}`}
                        className="p-2 border border-[#ECC8C4] bg-[#FDF1F0] text-[#9E352B] hover:bg-[#9E352B] hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {editing && (
        <div
          onClick={() => setEditing(null)}
          className="fixed inset-0 z-50 bg-[#141210]/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#FAF8F4] border border-[#E6DDD1] max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="px-6 py-4 bg-white border-b border-[#E6DDD1] flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-serif text-2xl text-[#181614]">
                {isNew ? 'Add New VELORA Fragrance' : `Edit ${editing.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-9 h-9 flex items-center justify-center border border-[#E6DDD1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Perfume Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Subtitle *
                  </label>
                  <input
                    type="text"
                    value={editing.subtitle || ''}
                    onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Category
                  </label>
                  <select
                    value={editing.category || 'Floral'}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Concentration
                  </label>
                  <input
                    type="text"
                    value={editing.concentration || ''}
                    onChange={(e) => setEditing({ ...editing, concentration: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
              </div>

              <div className="bg-white border border-[#E6DDD1] p-4 space-y-4">
                <ImageUploaderField
                  label="Primary Perfume Bottle Image *"
                  value={editing.image || ''}
                  onChange={(url) =>
                    setEditing({
                      ...editing,
                      image: url,
                      gallery: [url, ...(editing.gallery || []).slice(1)],
                    })
                  }
                />
                <ImageUploaderField
                  label="Secondary Hover / Editorial Image"
                  value={editing.gallery?.[1] || editing.image || ''}
                  onChange={(url) => {
                    const primary = editing.image || url;
                    const rest = (editing.gallery || []).slice(2);
                    setEditing({ ...editing, gallery: [primary, url, ...rest] });
                  }}
                />
              </div>

              {/* Prices & Stock per Volume */}
              <div className="bg-white border border-[#E6DDD1] p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#9A7742] font-medium">
                  Bottle Volumes, Pricing (INR) &amp; Inventory
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['30ml', '50ml', '100ml'] as BottleVolume[]).map((vol) => {
                    const vObj = editing.volumes?.find((v) => v.volume === vol);
                    const stockQty = editing.stock?.[vol] ?? 0;
                    return (
                      <div key={vol} className="p-3 bg-[#FAF8F4] border border-[#E6DDD1] space-y-2">
                        <p className="font-serif text-lg text-[#181614]">{vol} Flacon</p>
                        <div>
                          <label className="block text-[10px] uppercase text-[#6E655E]">
                            Selling Price (₹)
                          </label>
                          <input
                            type="number"
                            value={vObj?.price ?? 0}
                            onChange={(e) =>
                              updateVolumePrice(vol, 'price', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E6DDD1] text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#6E655E]">
                            MRP / Compare Price (₹)
                          </label>
                          <input
                            type="number"
                            value={vObj?.originalPrice ?? ''}
                            onChange={(e) =>
                              updateVolumePrice(vol, 'originalPrice', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E6DDD1] text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#6E655E]">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={stockQty}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                stock: {
                                  '30ml': editing.stock?.['30ml'] ?? 0,
                                  '50ml': editing.stock?.['50ml'] ?? 0,
                                  '100ml': editing.stock?.['100ml'] ?? 0,
                                  [vol]: Math.max(0, Number(e.target.value)),
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E6DDD1] text-xs tabular-nums"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Top Notes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editing.notes?.top || []).join(', ')}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        notes: {
                          top: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          heart: editing.notes?.heart || [],
                          base: editing.notes?.base || [],
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Heart Notes
                  </label>
                  <input
                    type="text"
                    value={(editing.notes?.heart || []).join(', ')}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        notes: {
                          top: editing.notes?.top || [],
                          heart: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          base: editing.notes?.base || [],
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    value={(editing.notes?.base || []).join(', ')}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        notes: {
                          top: editing.notes?.top || [],
                          heart: editing.notes?.heart || [],
                          base: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={editing.shortDescription || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, shortDescription: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Full Editorial Dossier Description
                  </label>
                  <textarea
                    rows={3}
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.published !== false}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                    className="accent-[#181614] w-4 h-4"
                  />
                  <span>Published on Storefront</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.featured)}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                    className="accent-[#181614] w-4 h-4"
                  />
                  <span>Featured Signature</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.inCollectionCarousel !== false}
                    onChange={(e) =>
                      setEditing({ ...editing, inCollectionCarousel: e.target.checked })
                    }
                    className="accent-[#181614] w-4 h-4"
                  />
                  <span>Show in Collection Slider</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#E6DDD1]">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 border border-[#E6DDD1] bg-white text-xs uppercase tracking-[0.14em]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.14em]"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 2. CATEGORIES MANAGEMENT ───────────────────────────────────────────────────
export const AdminCategoriesView: React.FC<CatalogProps> = ({ data, onRefresh, onNotify }) => {
  const { categories } = data;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingCat, setEditingCat] = useState<CategoryRecord | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      await onRefresh();
      onNotify('Category added.');
    }
  };

  const handleToggle = async (cat: CategoryRecord) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ active: !cat.active }),
    });
    await onRefresh();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    await fetch(`/api/admin/categories/${editingCat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editingCat),
    });
    setEditingCat(null);
    await onRefresh();
    onNotify('Category updated.');
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
    await onRefresh();
    onNotify('Category deleted.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form
        onSubmit={handleCreate}
        className="lg:col-span-4 bg-white border border-[#E6DDD1] p-6 space-y-4 self-start"
      >
        <h2 className="font-serif text-2xl text-[#181614]">Add Fragrance Category</h2>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Gourmand"
            className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
            Olfactory Summary
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe botanical accords in this family..."
            className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs uppercase tracking-[0.16em]"
        >
          Create Category
        </button>
      </form>

      <div className="lg:col-span-8 bg-white border border-[#E6DDD1] divide-y divide-[#E6DDD1]">
        <div className="px-6 py-4 border-b border-[#E6DDD1]">
          <h2 className="font-serif text-2xl text-[#181614]">Olfactory Families</h2>
        </div>
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {editingCat?.id === cat.id ? (
              <form onSubmit={handleSaveEdit} className="flex-1 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="px-3 py-1.5 border border-[#E6DDD1] text-sm"
                />
                <input
                  type="text"
                  value={editingCat.description}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                  className="px-3 py-1.5 border border-[#E6DDD1] text-sm flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#181614] text-white text-xs uppercase"
                >
                  Save
                </button>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-xl text-[#181614]">{cat.name}</h3>
                  <button
                    type="button"
                    onClick={() => handleToggle(cat)}
                    className={`px-2 py-0.5 text-[10px] uppercase border ${
                      cat.active
                        ? 'bg-[#EDF5EF] text-[#1F5D37] border-[#C5DFCC]'
                        : 'bg-[#F2ECE4] text-[#6E655E] border-[#E6DDD1]'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-[#6E655E] mt-1">{cat.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingCat(cat)}
                className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] hover:border-[#181614]"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id)}
                className="p-2 border border-[#ECC8C4] bg-[#FDF1F0] text-[#9E352B]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 3. INVENTORY MANAGEMENT ────────────────────────────────────────────────────
export const AdminInventoryView: React.FC<CatalogProps> = ({ data, onRefresh, onNotify }) => {
  const { products, inventoryMovements } = data;
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [adjustTarget, setAdjustTarget] = useState<{
    productId: string;
    productName: string;
    volume: BottleVolume;
    current: number;
  } | null>(null);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Atelier batch restock');

  const rows = useMemo(() => {
    const list: {
      product: Product;
      volume: BottleVolume;
      qty: number;
      threshold: number;
    }[] = [];
    for (const p of products) {
      const thresh = p.lowStockThreshold ?? 10;
      (['30ml', '50ml', '100ml'] as BottleVolume[]).forEach((vol) => {
        const qty = p.stock?.[vol] ?? 0;
        if (stockFilter === 'low' && qty > thresh) return;
        if (stockFilter === 'out' && qty > 0) return;
        list.push({ product: p, volume: vol, qty, threshold: thresh });
      });
    }
    return list;
  }, [products, stockFilter]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const res = await fetch('/api/admin/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId: adjustTarget.productId,
        volume: adjustTarget.volume,
        type: adjustType,
        quantity: adjustQty,
        reason: adjustReason,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotify(json.error || 'Adjustment failed.');
      return;
    }
    setAdjustTarget(null);
    await onRefresh();
    onNotify('Inventory stock updated and movement logged.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6DDD1] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#9A7742]" />
          <span className="font-serif text-xl text-[#181614]">Bottle Stock Control</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All SKUs'],
              ['low', 'Low Stock Alerts'],
              ['out', 'Out of Stock'],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStockFilter(k)}
              className={`px-3.5 py-2 text-xs uppercase tracking-[0.14em] border ${
                stockFilter === k
                  ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                  : 'bg-[#FAF8F4] text-[#6E655E] border-[#E6DDD1]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
            <tr>
              <th className="py-3 px-4">Fragrance</th>
              <th className="py-3 px-4">Volume</th>
              <th className="py-3 px-4">Available</th>
              <th className="py-3 px-4">Threshold</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Stock Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDD1]">
            {rows.map((r) => (
              <tr key={`${r.product.id}-${r.volume}`}>
                <td className="py-3 px-4 font-medium text-[#181614]">{r.product.name}</td>
                <td className="py-3 px-4 text-xs">{r.volume}</td>
                <td className="py-3 px-4 font-semibold tabular-nums">{r.qty}</td>
                <td className="py-3 px-4 text-xs text-[#6E655E] tabular-nums">{r.threshold}</td>
                <td className="py-3 px-4">
                  {r.qty === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] bg-[#FDF1F0] text-[#9E352B] border border-[#ECC8C4]">
                      <AlertTriangle className="w-3 h-3" /> Out of Stock
                    </span>
                  ) : r.qty <= r.threshold ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] bg-[#FAF3E6] text-[#8A5D19] border border-[#E6D1AD]">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[11px] bg-[#EDF5EF] text-[#1F5D37] border border-[#C5DFCC]">
                      Optimal
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustTarget({
                        productId: r.product.id,
                        productName: r.product.name,
                        volume: r.volume,
                        current: r.qty,
                      });
                      setAdjustType('stock_in');
                      setAdjustQty(10);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-[11px] uppercase tracking-[0.12em]"
                  >
                    <ArrowDownUp className="w-3 h-3" /> Adjust Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movement History */}
      <div className="bg-white border border-[#E6DDD1]">
        <div className="px-5 py-4 border-b border-[#E6DDD1]">
          <h3 className="font-serif text-xl text-[#181614]">Stock Movement Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] uppercase tracking-wider text-[#6E655E]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Change</th>
                <th className="py-2.5 px-4">Stock Level</th>
                <th className="py-2.5 px-4">Reason &amp; Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDD1]">
              {inventoryMovements.slice(0, 20).map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 px-4 text-[#6E655E] tabular-nums whitespace-nowrap">
                    {formatDateTimeIN(m.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-[#181614]">
                    {m.productName} ({m.volume})
                  </td>
                  <td className="py-2.5 px-4 uppercase">{m.type.replace('_', ' ')}</td>
                  <td
                    className={`py-2.5 px-4 font-semibold tabular-nums ${
                      m.quantityChange >= 0 ? 'text-[#1F5D37]' : 'text-[#9E352B]'
                    }`}
                  >
                    {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                  </td>
                  <td className="py-2.5 px-4 tabular-nums">
                    {m.previousStock} → <strong>{m.newStock}</strong>
                  </td>
                  <td className="py-2.5 px-4 text-[#6E655E]">
                    {m.reason} · {m.actorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustTarget && (
        <div
          onClick={() => setAdjustTarget(null)}
          className="fixed inset-0 z-50 bg-[#141210]/60 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAdjust}
            className="w-full max-w-md bg-white border border-[#E6DDD1] p-6 space-y-4"
          >
            <h3 className="font-serif text-2xl text-[#181614]">
              Adjust Stock: {adjustTarget.productName} ({adjustTarget.volume})
            </h3>
            <p className="text-xs text-[#6E655E]">
              Current Available: <strong className="text-[#181614]">{adjustTarget.current}</strong>
            </p>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                Movement Type
              </label>
              <select
                value={adjustType}
                onChange={(e) =>
                  setAdjustType(e.target.value as 'stock_in' | 'stock_out' | 'adjustment')
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              >
                <option value="stock_in">Stock In (Add Bottles)</option>
                <option value="stock_out">Stock Out (Remove Bottles)</option>
                <option value="adjustment">Exact Stock Override</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                {adjustType === 'adjustment' ? 'New Total Stock' : 'Quantity'}
              </label>
              <input
                type="number"
                min={0}
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                Reason
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="px-4 py-2 border border-[#E6DDD1] text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase"
              >
                Apply Stock Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

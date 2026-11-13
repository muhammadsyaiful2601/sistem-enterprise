// src/pages/CartPage.jsx
// Halaman keranjang: isi dari cart-service, nama dan harga dari product-service.
// Folder interaktif (React Bits): drag & drop, klik detail, buang ke tempat sampah.
// Tabel detail di bawah folder dengan optimistic update.

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCartDetail } from '../api/aggregate'
import { clearCart, removeCartItem, updateCartItem } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import Folder from '../components/Folder'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

export default function CartPage({ userId }) {
  const { loading, data, error, reload } = useAsync(() => getCartDetail(userId), [userId])
  const [actionError, setActionError] = useState(null)
  const [focusedItem, setFocusedItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [isFolderOpen, setIsFolderOpen] = useState(true)
  const [localItems, setLocalItems] = useState(null)
  const trashRef = useRef(null)
  const folderRef = useRef(null)
  const lastDataRef = useRef(null)
  if (data) lastDataRef.current = data
  const displayData = data || lastDataRef.current

  // Reset optimistic update saat data server berubah
  useEffect(() => {
    setLocalItems(null)
  }, [displayData]) // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveData = localItems
    ? { ...displayData, items: localItems }
    : displayData

  // Sinkronkan focusedItem dengan data terbaru
  useEffect(() => {
    if (focusedItem && effectiveData) {
      const fresh = effectiveData.items.find(i => i.id === focusedItem.id)
      if (fresh && fresh.quantity !== focusedItem.quantity) {
        setFocusedItem(fresh)
      }
    }
  }, [effectiveData]) // eslint-disable-line react-hooks/exhaustive-deps

  function requestDelete(cartItem) {
    setConfirmDelete(cartItem)
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return
    await removeItem(confirmDelete.id)
    setConfirmDelete(null)
  }

  async function run(action) {
    setActionError(null)
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err)
    }
  }

  async function removeItem(itemId) {
    // Optimistic: hapus dari UI dulu
    setLocalItems(prev => {
      const source = prev || displayData?.items || []
      return source.filter(i => i.id !== itemId)
    })
    await run(() => removeCartItem(itemId))
  }

  async function changeQty(itemId, delta) {
    const item = effectiveData?.items.find(i => i.id === itemId)
    if (!item) return
    const next = Math.max(1, item.quantity + delta)
    // Optimistic: update UI dulu
    setLocalItems(prev => {
      const source = prev || displayData?.items || []
      return source.map(i => (i.id === itemId ? { ...i, quantity: next } : i))
    })
    await run(() => updateCartItem(itemId, next))
  }

  async function clearCartOptimistic() {
    setLocalItems([])
    await run(() => clearCart(userId))
  }

  if (loading && !data) {
    return (
      <section className="cart-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">RINGKASAN PESANAN</p>
            <h1>Keranjang belanja</h1>
            <p className="page-intro">User {userId} · Periksa kembali pilihanmu.</p>
          </div>
          <Link className="text-link" to="/">Lanjut belanja <span aria-hidden="true">→</span></Link>
        </div>
        <div className="cart-skeleton" role="status" aria-label="Memuat keranjang">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cart-skeleton-row">
              <div className="skeleton skeleton-cart-art" />
              <div className="cart-skeleton-copy">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
              <div className="skeleton skeleton-line medium" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="cart-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">RINGKASAN PESANAN</p>
            <h1>Keranjang belanja</h1>
          </div>
          <Link className="text-link" to="/">Lanjut belanja <span aria-hidden="true">→</span></Link>
        </div>
        <div className="cart-error" role="alert" aria-live="polite">
          <span className="error-icon">⚠️</span>
          <p>{describeError(error)}</p>
          <button type="button" className="button-primary" onClick={reload}>Coba lagi</button>
        </div>
      </section>
    )
  }

  if (!effectiveData) return null

  if (effectiveData.items.length === 0 && !localItems) {
    return (
      <section className="cart-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">RINGKASAN PESANAN</p>
            <h1>Keranjang belanja</h1>
            <p className="page-intro">User {userId} · Periksa kembali pilihanmu.</p>
          </div>
          <Link className="text-link" to="/">Lanjut belanja <span aria-hidden="true">→</span></Link>
        </div>
        <div className="cart-empty">
          <div className="cart-empty-art" aria-hidden="true">
            <svg viewBox="0 0 160 160" fill="none">
              <path d="M25 51h110l-9 78H34l-9-78Z" />
              <path d="M56 56V42a24 24 0 0 1 48 0v14" />
              <path d="M62 84v.5M98 84v.5" />
              <path d="M65 103c8 7 22 7 30 0" />
            </svg>
            <span className="empty-art-spark spark-one" />
            <span className="empty-art-spark spark-two" />
          </div>
          <p className="eyebrow">BELUM ADA PILIHAN</p>
          <h2>Keranjangmu masih kosong</h2>
          <p className="muted">Temukan sesuatu yang kamu suka dan simpan di sini.</p>
          <Link className="button-primary shop-button" to="/">Mulai belanja <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    )
  }

  const items = effectiveData.items.map((item, index) => {
    const product = item.product
    const hasImage = Boolean(product?.image) && String(product.image).trim() !== ''
    return {
      image: hasImage ? product.image : null,
      title: product?.name || 'Produk tidak tersedia',
      description: product
        ? `${formatRupiah(product.price)} × ${item.quantity}`
        : 'Harga tidak tersedia',
      cartItem: item,
    }
  })

  const totalItems = effectiveData.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section className="cart-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">RINGKASAN PESANAN</p>
          <h1>Keranjang belanja</h1>
          <p className="page-intro">User {userId} · Geser item ke tempat sampah untuk menghapus.</p>
        </div>
        <Link className="text-link" to="/">Lanjut belanja <span aria-hidden="true">→</span></Link>
      </div>

      {actionError && (
        <div className="cart-error" role="alert" aria-live="polite">
          <span className="error-icon">⚠️</span>
          <p>{describeError(actionError)}</p>
          <button type="button" className="button-primary" onClick={reload}>Coba lagi</button>
        </div>
      )}

      <div className="cart-content">
        <div className="cart-folder-wrapper" ref={folderRef}>
          <Folder
            label="Keranjang"
            items={items}
            mode="flap"
            variant="solid"
            color="#1e463a"
            paperColor="#ffffff"
            tabPosition="right"
            layout="spread"
            size={1.05}
            openOn="click"
            defaultOpen
            onOpenChange={setIsFolderOpen}
            onItemClick={(item, index) => {
              const cartItem = effectiveData.items[index]
              setFocusedItem(cartItem)
            }}
            onItemDrop={(item, index, inside, dropX, dropY) => {
              if (!inside && dropX != null && dropY != null && trashRef.current && folderRef.current) {
                const folderRect = folderRef.current.getBoundingClientRect()
                const scaleX = folderRect.width / (folderRef.current.offsetWidth || 1)
                const scaleY = folderRect.height / (folderRef.current.offsetHeight || 1)
                const viewportX = folderRect.left + dropX * scaleX
                const viewportY = folderRect.top + dropY * scaleY
                const rect = trashRef.current.getBoundingClientRect()
                const overTrash =
                  viewportX >= rect.left &&
                  viewportX <= rect.right &&
                  viewportY >= rect.top &&
                  viewportY <= rect.bottom
                if (overTrash) {
                  const cartItem = effectiveData.items[index]
                  requestDelete(cartItem)
                }
              }
            }}
            draggable
            zoomOnClick
            peek
            bounce={0.4}
            speed={1}
          />
          <div
            ref={trashRef}
            className="trash-zone-below"
            role="button"
            aria-label="Tempat sampah — seret item ke sini untuk menghapus"
          >
            <span className="trash-icon">🗑️</span>
            <span className="trash-label">Tempat sampah</span>
          </div>

          {isFolderOpen && effectiveData.items.length > 0 && (
            <div className="cart-items-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Produk</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Harga</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Jumlah</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Subtotal</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveData.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span aria-hidden="true" style={{ fontSize: '1.75rem', opacity: 0.4 }}>📦</span>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '0.9rem' }}>
                                {item.product.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                SKU: {item.product_id}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <em style={{ color: 'var(--muted)' }}>Produk tidak tersedia</em>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {item.product ? formatRupiah(item.product.price) : '-'}
                      </td>
                      <td>
                        <div className="table-qty-stepper">
                          <button
                            type="button"
                            aria-label="Kurangi"
                            disabled={item.quantity <= 1}
                            onClick={() => changeQty(item.id, -1)}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Tambah"
                            onClick={() => changeQty(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {item.product
                          ? formatRupiah(Number(item.product.price) * item.quantity)
                          : '-'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-delete-btn"
                          onClick={() => requestDelete(item)}
                          aria-label="Hapus item"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <p className="summary-label">Ringkasan belanja</p>
          <div className="summary-line"><span>Jumlah item</span><strong>{totalItems}</strong></div>
          <div className="summary-total"><span>Total</span><strong>{formatRupiah(effectiveData.totalPrice)}</strong></div>
          <p className="summary-note">Total belum termasuk biaya pengiriman.</p>
          <button className="button-secondary clear-cart-button" type="button" onClick={clearCartOptimistic}>
            Kosongkan keranjang
          </button>
        </aside>
      </div>

      {focusedItem && (
        <div className="cart-detail-overlay" role="dialog" aria-modal="true" aria-label="Detail item keranjang">
          <div className="cart-detail-card">
            <button type="button" className="cart-detail-close" onClick={() => setFocusedItem(null)} aria-label="Tutup detail">✕</button>
            <div className="cart-detail-image">
              {focusedItem.product?.image ? (
                <img
                  src={focusedItem.product.image}
                  alt={focusedItem.product.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="cart-detail-image-placeholder">📦</div>
              )}
            </div>
            <h2>{focusedItem.product?.name || 'Produk tidak tersedia'}</h2>
            {focusedItem.product?.description && (
              <p className="cart-detail-desc">{focusedItem.product.description}</p>
            )}
            <div className="cart-detail-meta">
              <div className="cart-detail-meta-item">
                <span className="cart-detail-meta-label">Harga</span>
                <span className="cart-detail-meta-value">
                  {focusedItem.product ? formatRupiah(focusedItem.product.price) : 'Harga tidak tersedia'}
                </span>
              </div>
              <div className="cart-detail-meta-item">
                <span className="cart-detail-meta-label">Stok</span>
                <span className="cart-detail-meta-value">
                  {focusedItem.product?.stock != null ? focusedItem.product.stock : 'Tidak diketahui'}
                </span>
              </div>
              <div className="cart-detail-meta-item">
                <span className="cart-detail-meta-label">Jumlah</span>
                <span className="cart-detail-meta-value">{focusedItem.quantity}</span>
              </div>
              <div className="cart-detail-meta-item">
                <span className="cart-detail-meta-label">Subtotal</span>
                <span className="cart-detail-meta-value cart-detail-subtotal-value">
                  {focusedItem.product ? formatRupiah(Number(focusedItem.product.price) * focusedItem.quantity) : '—'}
                </span>
              </div>
            </div>
            <div className="cart-detail-qty">
              <label>Ubah jumlah</label>
              <div className="quantity-stepper">
                <button type="button" aria-label="Kurangi" disabled={focusedItem.quantity <= 1} onClick={() => changeQty(focusedItem.id, -1)}>−</button>
                <span>{focusedItem.quantity}</span>
                <button type="button" aria-label="Tambah" onClick={() => changeQty(focusedItem.id, 1)}>+</button>
              </div>
            </div>
            <button type="button" className="button-danger remove-focus-button" onClick={() => { requestDelete(focusedItem); setFocusedItem(null) }}>
              Hapus dari keranjang
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="cart-confirm-overlay" role="alertdialog" aria-modal="true" aria-label="Konfirmasi hapus">
          <div className="cart-confirm-card">
            <div className="cart-confirm-icon">🗑️</div>
            <h3>Yakin ingin menghapus?</h3>
            <p className="muted">
              "{confirmDelete.product?.name || 'Produk ini'}" akan dihapus dari keranjang. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="cart-confirm-actions">
              <button type="button" className="button-secondary" onClick={() => setConfirmDelete(null)}>
                Batal
              </button>
              <button type="button" className="button-danger" onClick={confirmDeleteAction}>
                Ya, hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
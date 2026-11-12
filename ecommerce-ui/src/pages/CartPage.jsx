// src/pages/CartPage.jsx
// Halaman keranjang: isi dari cart-service, nama dan harga dari product-service.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCartDetail } from '../api/aggregate'
import { clearCart, removeCartItem, updateCartItem } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

export default function CartPage({ userId }) {
  const { loading, data, error, reload } = useAsync(() => getCartDetail(userId), [userId])
  const [actionError, setActionError] = useState(null)

  // Menjalankan aksi ke cart-service, lalu memuat ulang keranjang kalau berhasil.
  async function run(action) {
    setActionError(null)
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err)
    }
  }

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
      {actionError && (
        <p className="alert alert-error">{describeError(actionError)}</p>
      )}
      <AsyncView
        loading={loading}
        error={error}
        onRetry={reload}
        loadingContent={
          <div className="cart-skeleton" role="status" aria-label="Memuat keranjang">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="cart-skeleton-row" key={index}>
                <div className="skeleton skeleton-cart-art" />
                <div className="cart-skeleton-copy"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>
                <div className="skeleton skeleton-line medium" />
              </div>
            ))}
          </div>
        }
      >
        {data && data.items.length === 0 && (
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
        )}
        {data && data.items.length > 0 && (
          <>
            <div className="cart-content">
              <div className="cart-items">
                {data.items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-art" aria-hidden="true">
                      <svg viewBox="0 0 64 64" fill="none">
                        <path d="M12 23h40l-3.2 31H15.2L12 23Z" />
                        <path d="M23 25v-6a9 9 0 0 1 18 0v6" />
                      </svg>
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.product ? item.product.name : <em>Produk tidak tersedia</em>}</h3>
                      <p className="muted">{item.product ? formatRupiah(item.product.price) : 'Harga tidak tersedia'}</p>
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah"
                          disabled={item.quantity <= 1}
                          onClick={() => run(() => updateCartItem(item.id, item.quantity - 1))}
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah"
                          onClick={() => run(() => updateCartItem(item.id, item.quantity + 1))}
                        >+</button>
                      </div>
                    </div>
                    <div className="cart-item-end">
                      <strong>{item.product ? formatRupiah(Number(item.product.price) * item.quantity) : '—'}</strong>
                      <button className="remove-button" type="button" onClick={() => run(() => removeCartItem(item.id))}>Hapus</button>
                    </div>
                  </article>
                ))}
              </div>
              <aside className="cart-summary">
                <p className="summary-label">Ringkasan belanja</p>
                <div className="summary-line"><span>Jumlah item</span><strong>{data.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
                <div className="summary-total"><span>Total</span><strong>{formatRupiah(data.totalPrice)}</strong></div>
                <p className="summary-note">Total belum termasuk biaya pengiriman.</p>
                <button className="button-secondary clear-cart-button" type="button" onClick={() => run(() => clearCart(userId))}>Kosongkan keranjang</button>
              </aside>
            </div>
          </>
        )}
      </AsyncView>
    </section>
  )
}

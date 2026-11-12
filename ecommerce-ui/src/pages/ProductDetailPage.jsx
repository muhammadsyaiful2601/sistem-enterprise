// src/pages/ProductDetailPage.jsx
// Halaman detail: informasi produk, tombol masuk keranjang, dan daftar review.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import ReviewForm from '../components/ReviewForm'
import StarRating from '../components/StarRating'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

export default function ProductDetailPage({ userId }) {
  const { id } = useParams() // nilai id dari alamat /products/:id
  const { loading, data, error, reload } = useAsync(() => getProductDetail(id), [id])

  // Jumlah disimpan sebagai teks, supaya kolomnya bisa dikosongkan saat mengetik.
  const [quantity, setQuantity] = useState('1')
  const [cartMessage, setCartMessage] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!cartMessage) return undefined
    const timeout = window.setTimeout(() => setCartMessage(null), 3600)
    return () => window.clearTimeout(timeout)
  }, [cartMessage])

  async function handleAddToCart() {
    if (adding) return
    const amount = Math.max(1, Number(quantity) || 1)
    setAdding(true)
    try {
      await addToCart(userId, Number(id), amount)
      setCartMessage({ type: 'success', text: 'Produk berhasil masuk ke keranjang.' })
    } catch (err) {
      setCartMessage({ type: 'error', text: describeError(err) })
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="detail-page">
      <Link className="back-link" to="/"><span aria-hidden="true">←</span> Kembali ke produk</Link>
      <AsyncView
        loading={loading}
        error={error}
        onRetry={reload}
        loadingContent={
          <div className="detail-skeleton" role="status" aria-label="Memuat detail produk">
            <div className="skeleton skeleton-detail-art" />
            <div className="detail-skeleton-copy">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line title-line" />
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-button" />
            </div>
          </div>
        }
      >
        {data && (
          <>
            <div className="detail-layout">
              <div className="detail-visual" aria-hidden="true">
                <span className="visual-label">PILIHAN TOKO</span>
                <svg viewBox="0 0 180 180" fill="none">
                  <path d="M31 63h118l-9.5 91h-99L31 63Z" />
                  <path d="M63 68V49a27 27 0 0 1 54 0v19" />
                  <path d="M67 98v2M113 98v2" />
                </svg>
                <span className="visual-caption">Pilihan berkualitas,<br />untuk keseharianmu.</span>
              </div>
              <div className="detail-info">
                <div className="service-badges">
                  <span className="service-pill"><span /> Layanan: product-service</span>
                  <span className={`stock-pill ${data.product.stock > 0 ? 'is-available' : 'is-sold-out'}`}>
                    {data.product.stock > 0 ? 'Tersedia' : 'Stok habis'}
                  </span>
                </div>
                <h1>{data.product.name}</h1>
                <p className="detail-description">{data.product.description}</p>
                <div className="detail-rating">
                  {data.reviews ? (
                    <StarRating
                      average={data.reviews.summary.average_rating}
                      total={data.reviews.summary.total_reviews}
                    />
                  ) : (
                    <span className="muted">Rating belum tersedia</span>
                  )}
                </div>
                <div className="detail-price-block">
                  <span className="price-label">Harga</span>
                  <p className="price detail-price">{formatRupiah(data.product.price)}</p>
                  <p className="stock-copy">{data.product.stock} produk tersedia</p>
                </div>
                <div className="actions">
                  <label className="quantity-control">
                    <span>Jumlah</span>
                    <input
                      type="number"
                      min="1"
                      max={data.product.stock || undefined}
                      value={quantity}
                      aria-label="Jumlah"
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </label>
                  <button
                    className="button-primary add-button"
                    type="button"
                    disabled={adding || data.product.stock <= 0}
                    onClick={handleAddToCart}
                  >
                    {adding ? <><span className="button-spinner" /> Menambahkan...</> : 'Masukkan ke keranjang'}
                  </button>
                </div>
                <div className="detail-note">
                  <span aria-hidden="true">✓</span> Transaksi nyaman, pilihan lebih mudah
                </div>
              </div>
            </div>

            <section className="reviews-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">DARI KOMUNITAS</p>
                  <h2>Ulasan &amp; Penilaian</h2>
                </div>
                {data.reviews && <span className="review-count">{data.reviews.summary.total_reviews} ulasan</span>}
              </div>
              {data.reviews ? (
                data.reviews.reviews.length ? (
                  <ul className="reviews">
                    {data.reviews.reviews.map((review) => (
                      <li key={review.id}>
                        <div className="review-item-heading">
                          <StarRating average={review.rating} total={1} compact />
                          <small className="muted">
                            User {review.user_id} · {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </small>
                        </div>
                        <p>{review.comment || <em className="muted">Tanpa komentar</em>}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="review-empty">
                    <span className="review-empty-icon" aria-hidden="true">✳</span>
                    <div><strong>Jadilah yang pertama memberi ulasan</strong><p className="muted">Bagikan pengalamanmu untuk membantu pembeli lain.</p></div>
                  </div>
                )
              ) : (
                <div className="review-unavailable" role="status">
                  <span className="review-unavailable-icon" aria-hidden="true">i</span>
                  <div><strong>Ulasan sedang tidak tersedia</strong><p>Kamu tetap dapat melihat produk. Silakan coba lagi nanti.</p></div>
                </div>
              )}
              <ReviewForm productId={Number(id)} userId={userId} onCreated={reload} />
            </section>
          </>
        )}
      </AsyncView>
      {cartMessage && (
        <div className={`toast toast-${cartMessage.type}`} role={cartMessage.type === 'error' ? 'alert' : 'status'}>
          <span className="toast-icon" aria-hidden="true">{cartMessage.type === 'success' ? '✓' : '!'}</span>
          <span>{cartMessage.text}</span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setCartMessage(null)}>×</button>
        </div>
      )}
    </section>
  )
}

// src/pages/ProductListPage.jsx
// Halaman daftar produk: data produk dari product-service, rating dari review-service.

import { useMemo, useState } from 'react'
import { getProductsWithRating } from '../api/aggregate'
import AsyncView from '../components/AsyncView'
import ProductCard from '../components/ProductCard'
import { useAsync } from '../hooks/useAsync'

export default function ProductListPage() {
  const { loading, data, error, reload } = useAsync(getProductsWithRating)
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState('all')

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID')
    return (data || []).filter((product) => {
      const matchesQuery = product.name.toLocaleLowerCase('id-ID').includes(normalizedQuery)
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' ? product.stock > 0 : product.stock <= 0)
      return matchesQuery && matchesAvailability
    })
  }, [availability, data, query])

  return (
    <section className="catalog-page">
      <div className="page-heading catalog-heading">
        <div>
          <p className="eyebrow">PILIHAN HARI INI</p>
          <h1>Temukan favoritmu.</h1>
          <p className="page-intro">Jelajahi koleksi pilihan dengan mudah dan nyaman.</p>
        </div>
        <span className="catalog-count">{data ? `${data.length} produk` : 'Koleksi terbaru'}</span>
      </div>
      <div className="catalog-toolbar">
        <label className="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            type="search"
            placeholder="Cari nama produk..."
            className="focus:border-transparent focus:ring-2 focus:ring-[#1e463a]"
            aria-label="Cari nama produk"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="filter-field">
          <span>Ketersediaan</span>
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="all">Semua produk</option>
            <option value="available">Tersedia</option>
            <option value="sold-out">Habis</option>
          </select>
        </label>
      </div>
      <AsyncView
        loading={loading}
        error={error}
        onRetry={reload}
        loadingContent={
          <div className="grid" role="status" aria-label="Memuat produk">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="card skeleton-card" key={index}>
                <div className="skeleton skeleton-art" />
                <div className="skeleton-copy">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        {data && (
          products.length ? (
            <div className="grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <span className="empty-results-icon" aria-hidden="true">⌕</span>
              <h2>Produk tidak ditemukan</h2>
              <p className="muted">Coba kata kunci atau filter yang berbeda.</p>
            </div>
          )
        )}
      </AsyncView>
    </section>
  )
}
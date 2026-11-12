// src/components/ProductCard.jsx
// Satu kartu produk di halaman daftar.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff, ShoppingCart } from 'lucide-react'
import { formatRupiah } from '../utils/format'
import ReflectiveCard from './ReflectiveCard'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const { id, name, price, stock, rating } = product
  const image = typeof product.image === 'string' ? product.image.trim() : ''
  const [failedImage, setFailedImage] = useState('')

  return (
    <ReflectiveCard
      className="card group overflow-hidden rounded-2xl border border-[#e8e7e1] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      name={name}
      role={formatRupiah(price)}
      status={stock > 0 ? 'Tersedia' : 'Habis'}
      statusColor={stock > 0 ? '#22c55e' : '#ef4444'}
      theme="light"
      metalness={0.45}
      roughness={0.5}
      glare={0.18}
      shine={0.8}
      bevel={1}
      width="100%"
      height="auto"
      radius={16}
    >
      {image && failedImage !== image ? (
        <img
          className="h-48 w-full rounded-t-2xl object-cover"
          src={image}
          alt={name}
          loading="lazy"
          onError={() => setFailedImage(image)}
        />
      ) : (
        <div className="product-image-empty h-48 w-full rounded-t-2xl" role="img" aria-label="Gambar produk belum tersedia">
          <ImageOff aria-hidden="true" size={30} strokeWidth={1.6} />
          <span>Gambar belum tersedia</span>
        </div>
      )}
      <div className="product-card-content">
        <div className="product-card-meta flex items-center justify-between">
          <span className={`stock-pill ${stock > 0 ? 'is-available' : 'is-sold-out'}`}>
            {stock > 0 ? 'Tersedia' : 'Habis'}
          </span>
          <span className="product-stock">{stock > 0 ? `${stock} stok` : 'Stok 0'}</span>
        </div>
        <h3>
          <Link to={`/products/${id}`} className="hover:text-[#1e463a]">{name}</Link>
        </h3>
        <p className="price text-xl font-bold text-[#1e463a]">{formatRupiah(price)}</p>
        {rating ? (
          <StarRating average={rating.average_rating} total={rating.total_reviews} />
        ) : (
          <span className="muted">Rating belum tersedia</span>
        )}
        <Link
          className="product-card-cta mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e463a] py-2.5 font-medium text-white transition-colors hover:bg-[#15332a]"
          to={`/products/${id}`}
        >
          <ShoppingCart aria-hidden="true" size={17} strokeWidth={2} />
          Lihat detail
        </Link>
      </div>
    </ReflectiveCard>
  )
}
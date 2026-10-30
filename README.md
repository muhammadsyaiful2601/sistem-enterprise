# Microservices E-Commerce: Order Service Integration

Repositori ini berisi integrasi arsitektur Microservices untuk toko online yang terdiri dari `product-service`, `cart-service`, `review-service`, dan `order-service` yang dibangun menggunakan Laravel dan MySQL sebagai tugas Ujian Tengah Semester (UTS).

---

## 📌 1. Arsitektur Sistem & Pemisahan Lapisan

### Diagram Alur Komunikasi Antar-Service

```text
[ Client / Postman ]
         │
         ▼
  ┌──────────────┐          HTTP GET          ┌─────────────────┐
  │ order-service│ ─────────────────────────> │ product-service │ (Port 3000)
  │  (Port 3003) │                            └─────────────────┘
  └──────┬───────┘                                     │
         │ HTTP GET/DELETE                             ▼
         ▼                                        [ MySQL DB ]
  ┌──────────────┐
  │ cart-service │ (Port 3001)
  └──────┬───────┘
         │
         ▼
   [ Postgres DB ]
```

### Pembagian Lapisan Order Service (Layered Architecture):
- **Routes (`routes/api.php`)**: Menangani pemetaan endpoint API HTTP.
- **Form Request (`app/Http/Requests`)**: Memvalidasi aturan input request dari client.
- **Controller (`app/Http/Controllers`)**: Menangani HTTP Request/Response tanpa menyimpan logika bisnis.
- **Service Layer (`app/Services`)**: Tempat eksekusi logika bisnis checkout, transaksi database, dan aturan validasi stok.
- **HTTP Clients (`app/Clients`)**: Berkomunikasi ke `product-service` dan `cart-service` menggunakan HTTP Client dengan timeout 5 detik.
- **Eloquent Models (`app/Models`)**: Berkomunikasi langsung ke database MySQL `order_service_db`.

---

## 🚀 2. Langkah Menjalankan Sistem

1. Clone repositori ini ke komputer lokal:
   ```bash
   git clone <URL_REPOSITORI_PUBLIC>
   cd <NAMA_REPO>
   ```

2. Buat file `.env` di dalam folder `order-service` dari `.env.example`:
   ```bash
   cp order-service/.env.example order-service/.env
   ```

3. Jalankan seluruh service menggunakan Docker Compose dari root direktori:
   ```bash
   docker compose up --build -d
   ```

4. Jalankan migrasi database di dalam container `order-service`:
   ```bash
   docker compose exec order-service php artisan migrate
   ```

5. Seluruh service siap diakses:
   - **Product Service**: `http://localhost:3000`
   - **Cart Service**: `http://localhost:3001`
   - **Order Service**: `http://localhost:3003`

---

## 🌐 3. Daftar Endpoint Order Service

| Method | Endpoint | Fungsi | Status Sukses | Condition & Status Gagal |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Check kesehatan service | `200` | - |
| `POST` | `/api/orders` | Checkout pesanan dari keranjang | `201` | `422` (body invalid), `409` (keranjang kosong/stok kurang), `503` (service lain mati), `500` (error server) |
| `GET` | `/api/orders/{id}` | Detail satu pesanan beserta item | `200` | `404` (pesanan/ID tidak valid) |
| `GET` | `/api/orders/user/{userId}` | Daftar pesanan user (`?status=`) | `200` | `422` (status tidak valid) |
| `PATCH` | `/api/orders/{id}/pay` | Bayar pesanan (PENDING -> PAID) | `200` | `404` (pesanan tidak ada), `409` (status bukan PENDING) |

---

## 🔑 4. Environment Variables (`order-service`)

| Variable | Deskripsi | Default Value (Docker) |
| :--- | :--- | :--- |
| `APP_ENV` | Lingkungan aplikasi | `local` |
| `APP_DEBUG` | Mode debug error | `true` |
| `DB_CONNECTION` | Driver database | `mysql` |
| `DB_HOST` | Host database MySQL internal | `order-db` |
| `DB_PORT` | Port database MySQL | `3306` |
| `DB_DATABASE` | Nama database order service | `order_service_db` |
| `DB_USERNAME` | Username MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | `rootpassword` |
| `PRODUCT_SERVICE_URL` | Endpoint internal Product Service | `http://product-service:3000` |
| `CART_SERVICE_URL` | Endpoint internal Cart Service | `http://cart-service:3001` |

---

## 💡 5. Keputusan Desain & Keterbatasan

1. **Snapshot Harga & Nama Produk**: Nama dan harga produk disalin (*price snapshot*) ke tabel `order_items` saat pesanan dibuat. Perubahan harga di katalog `product-service` selanjutnya tidak mempengaruhi nilai pesanan historis yang telah berhasil dibuat.
2. **Database Transaction (`DB::transaction`)**: Proses penyimpanan pesanan di tabel `orders` dan item di `order_items` dibungkus dalam transaksi database untuk menjamin integritas data secara atomic.
3. **Resilience & Fallback Pengosongan Keranjang**: Jika pesanan berhasil disimpan di database tetapi `cart-service` gagal dikosongkan (misal karena gangguan sementara), transaksi pesanan tetap bernilai `201 Created` dan kegagalan pengosongan keranjang dicatat ke log aplikasi (`Log::warning`).
4. **Keterbatasan Solusi**: Sistem ini belum mencakup pembatalan pesanan (*order cancellation*), pembayaran riil (hanya simulasi status), dan pengurangan jumlah stok riil di `product-service`.

---

## 🎬 6. Tautan Video Demo & Commit SHA

- **Link Video Demo**: (https://drive.google.com/drive/folders/1Ied4ZrWUOlbf0g85Sqzkd26dNNsPW1C4?usp=sharing)
- **Commit SHA Terakhir**: `f9b25fa52998c295d4a3bd17788c32ee6bc7e684`

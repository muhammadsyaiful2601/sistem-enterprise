<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Menjalankan API untuk Insomnia

Jalankan seluruh service dari folder utama repository:

```sh
docker compose up --build -d
```

Tunggu sampai container `product-service`, `cart-service`, dan kedua database berjalan:

```sh
docker compose ps
```

API dapat diakses dari komputer lokal:

- Product Service: `http://localhost:3000`
- Cart Service: `http://localhost:3001`

Cart Service menghubungi Product Service melalui jaringan Docker di `http://product-service:3000`. Jangan gunakan `localhost:3000` untuk koneksi antarkontainer.

Impor [`insomnia/collection.json`](./insomnia/collection.json) melalui Insomnia: **Import > From File**. Pilih environment **Base Environment**; URL `localhost` dipakai karena Insomnia berjalan di komputer host. Collection menyediakan request health check, melihat produk, dan menguji operasi keranjang.

### Endpoint Cart Service

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET` | `/carts/{userId}` | Melihat isi keranjang user |
| `POST` | `/carts` | Menambah produk ke keranjang |
| `PUT` | `/carts/items/{id}` | Mengubah quantity item |
| `DELETE` | `/carts/items/{id}` | Menghapus satu item |
| `DELETE` | `/carts/{userId}` | Mengosongkan keranjang user |

### Urutan pengujian

1. `GET http://localhost:3000/health` untuk memastikan Product Service aktif.
2. `GET http://localhost:3000/products` untuk melihat produk yang tersedia. Database produk baru diisi contoh produk saat pertama kali dibuat.
3. `POST http://localhost:3001/carts` dengan body JSON:

   ```json
   {
     "user_id": 1,
     "product_id": 1,
     "quantity": 2
   }
   ```

   Gunakan `product_id` yang benar-benar ada dari langkah sebelumnya. Produk valid menghasilkan `201` untuk item baru (atau `200` bila item user/produk itu sudah ada); produk tidak ditemukan menghasilkan `404`.
4. `GET http://localhost:3001/carts/1` untuk melihat keranjang.
5. Atur nilai environment `item_id` di Insomnia ke `id` item dari response POST, lalu gunakan `PUT http://localhost:3001/carts/items/{id}` dengan body:

   ```json
   {
     "quantity": 3
   }
   ```

6. Uji penghapusan melalui `DELETE http://localhost:3001/carts/items/{id}` atau kosongkan semua item milik user dengan `DELETE http://localhost:3001/carts/1`.

Semua request body menggunakan JSON (`Content-Type: application/json`). Untuk menghentikan service tanpa menghapus data database, jalankan `docker compose down` dari folder utama repository.

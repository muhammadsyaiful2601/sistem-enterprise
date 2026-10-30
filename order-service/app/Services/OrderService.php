<?php

namespace App\Services;

use App\Clients\CartServiceClient;
use App\Clients\ProductServiceClient;
use App\Exceptions\BusinessRuleException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    protected $cartClient;
    protected $productClient;

    public function __construct(CartServiceClient $cartClient, ProductServiceClient $productClient)
    {
        $this->cartClient = $cartClient;
        $this->productClient = $productClient;
    }

    public function checkout($userId)
    {
        // 1. Ambil keranjang user dari cart-service
        $cart = $this->cartClient->getCart($userId);

        if (!$cart || empty($cart['items'])) {
            throw new BusinessRuleException('Keranjang belanja kosong');
        }

        $orderItemsData = [];
        $totalAmount = 0;

        // 2. Iterasi setiap item di keranjang untuk validasi produk dan stok
        foreach ($cart['items'] as $cartItem) {
            $productId = $cartItem['product_id'];
            $quantity = $cartItem['quantity'];

            // Ambil data produk dari product-service
            $product = $this->productClient->getProductById($productId);

            if (!$product) {
                throw new BusinessRuleException("Produk dengan ID {$productId} tidak ditemukan di katalog");
            }

            // Periksa ketersediaan stok
            $stock = $product['stock'];
            if ($stock < $quantity) {
                throw new BusinessRuleException("Stok {$product['name']} tidak mencukupi: diminta {$quantity}, tersedia {$stock}");
            }

            // Harga dari product-service berbentuk teks/string (misal: "450000.00"), ubah ke angka float
            $unitPrice = (float) $product['price'];
            $subtotal = $unitPrice * $quantity;
            $totalAmount += $subtotal;

            // Siapkan data untuk snapshot (nama dan harga disalin saat itu juga)
            $orderItemsData[] = [
                'product_id' => $productId,
                'product_name' => $product['name'],
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ];
        }

        // 3. Simpan ke database menggunakan DB::transaction (seluruhnya tersimpan atau batal)
        $order = DB::transaction(function () use ($userId, $totalAmount, $orderItemsData) {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'PENDING',
                'total_amount' => $totalAmount,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->orderItems()->create($itemData);
            }

            return $order;
        });

        // 4. Kosongkan keranjang di cart-service
        try {
            $this->cartClient->clearCart($userId);
        } catch (\Exception $e) {
            // Sesuai aturan: jika pesanan tersimpan tapi keranjang gagal dikosongkan, tetap kembalikan 201 dan catat di log
            Log::warning("Gagal mengosongkan keranjang untuk user {$userId}: " . $e->getMessage());
        }

        // Muat relasi items untuk ditampilkan pada response
        return $order->load('orderItems');
    }
}
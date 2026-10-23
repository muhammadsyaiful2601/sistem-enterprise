<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Order;

class OrderQueryService
{
    // Memeriksa kesehatan layanan
    public function healthCheck()
    {
        return [
            "status" => "ok",
            "service" => "order-service"
        ];
    }

    // Mengambil detail pesanan berdasarkan ID
    public function getOrderById($id)
    {
        $order = Order::with('items')->find($id);
        
        if (!$order) {
            throw new BusinessRuleException("Pesanan dengan id {$id} tidak ditemukan");
        }

        return $order;
    }

    // Simulasi pembayaran pesanan
    public function payOrder($id)
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            throw new BusinessRuleException("Pesanan dengan id {$id} tidak ditemukan");
        }

        if ($order->status !== 'PENDING') {
            throw new BusinessRuleException("Pesanan berstatus {$order->status}, hanya pesanan PENDING yang dapat dibayar");
        }

        // Ubah status menjadi PAID
        $order->update(['status' => 'PAID']);

        return $order->fresh('items');
    }
}
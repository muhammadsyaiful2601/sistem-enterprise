<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Exceptions\NotFoundException;
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
        $order = Order::with('orderItems')->find($id);

        if (!$order) {
            throw new NotFoundException("Pesanan dengan id {$id} tidak ditemukan");
        }

        return $order;
    }

    // Mengambil seluruh pesanan dengan filter status opsional
    public function getAllOrders($status = null)
    {
        $query = Order::with('orderItems')->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    // Mengambil daftar pesanan satu user dengan filter status opsional
    public function getOrdersByUser($userId, $status = null)
    {
        $query = Order::with('orderItems')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    // Simulasi pembayaran pesanan
    public function payOrder($id)
    {
        $order = Order::with('orderItems')->find($id);

        if (!$order) {
            throw new NotFoundException("Pesanan dengan id {$id} tidak ditemukan");
        }

        if ($order->status !== 'PENDING') {
            throw new BusinessRuleException("Pesanan berstatus {$order->status}, hanya pesanan PENDING yang dapat dibayar");
        }

        // Ubah status menjadi PAID
        $order->update(['status' => 'PAID']);

        return $order->fresh('orderItems');
    }
}
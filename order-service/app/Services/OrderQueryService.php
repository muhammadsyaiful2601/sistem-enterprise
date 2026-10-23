<?php
namespace App\Services;

use App\Clients\BusiniessRulesException;
use App\Models\Order;

class OrderQueryService
{
    //memeriksa kesehatan layanan
    public function healthCheck()
    {
        return [
            "status" => "healthy"
            "service" => "order-service"
        ];
    }
    public function getOrderById(id)
    {
        $order = Order::with('items')->find($id);
        if (!$order) {
            throw new BusinessRuleException("Pesanan dengan id {$id} tidak di temukan");
        }
        if ($order->status !== 'PENDING') {
            throw new BusinessRuleException("Pesanan berstatus {$order->status}, hanya pesanan PENDING yang dapat dibayar");

            //ubag status menjadi PAID
            $order->(['status' => 'PAID'])
            return $order->fresh('items');
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderService;
use App\Services\OrderQueryService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderService;
    protected $queryService;

    public function __construct(OrderService $orderService, OrderQueryService $queryService)
    {
        $this->orderService = $orderService;
        $this->queryService = $queryService;
    }

    public function health()
    {
        return response()->json($this->queryService->healthCheck(), 200);
    }

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->checkout($request->user_id);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat',
            'data' => $order
        ], 201);
    }

    public function show($id)
    {
        if (!is_numeric($id)) {
            return response()->json(['message' => "Pesanan dengan id {$id} tidak ditemukan"], 404);
        }

        $order = $this->queryService->getOrderById($id);

        return response()->json([
            'message' => 'Berhasil mengambil pesanan',
            'data' => $order
        ], 200);
    }

    public function userOrders(Request $request, $userId)
    {
        $status = $request->query('status');
        $orders = $this->queryService->getOrdersByUser($userId, $status);

        return response()->json([
            'message' => 'Berhasil mengambil daftar pesanan',
            'data' => $orders
        ], 200);
    }

    public function pay($id)
    {
        if (!is_numeric($id)) {
            return response()->json(['message' => "Pesanan dengan id {$id} tidak ditemukan"], 404);
        }

        $order = $this->queryService->payOrder($id);

        return response()->json([
            'message' => 'Pesanan berhasil dibayar',
            'data' => $order
        ], 200);
    }
}
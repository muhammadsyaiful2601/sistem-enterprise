<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $cartServiceClient;

    public function __construct(OrderServiceClient $orderService)
    {
        $this->orderServiceClient = $orderService;
    }

    public function store(StoreOrderRequest $request)
    {
        
    $order = this->orderService->checkout($request->user_id);

    return response()->json([
        'message' => 'Pesanan berhasil dibuat',
        'data' => $order,
    ], 201);
    }
}

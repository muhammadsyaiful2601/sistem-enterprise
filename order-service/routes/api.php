<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/health', [OrderController::class, 'health']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::get('/orders/user/{userId}', [OrderController::class, 'userOrders']);
Route::patch('/orders/{id}/pay', [OrderController::class, 'pay']);
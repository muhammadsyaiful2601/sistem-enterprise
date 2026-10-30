<?php

namespace App\Clients;

use Illuminate\Support\Facades\Http;
use App\Exceptions\ExternalServiceException;

class CartServiceClient
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('CART_SERVICE_URL', 'http://cart-service:3001');
    }

    public function getCart($userId)
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/carts/{$userId}");

            if ($response->successful()) {
                return $response->json('data');
            }

            throw new \Exception('Unexpected http status '. $response->status());
        } catch (\Exception $e) {
            throw new ExternalServiceException('Cart service tidak dapat dihubungi, coba lagi nanti', 0, $e);
        }
    }

    public function clearCart($userId)
    {
        try {
            $response = Http::timeout(5)->delete("{$this->baseUrl}/carts/{$userId}");
            return $response->successful();
        } catch (\Exception $e) {
            throw new ExternalServiceException('Gagal mengosongkan keranjang di cart service', 0, $e);
        }
    }
}
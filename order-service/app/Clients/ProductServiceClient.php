<?php

namespace App\Clients;

use Illuminate\Support\Facades\Http;
use App\Exceptions\ExternalServiceException;

class ProductServiceClient
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('PRODUCT_SERVICE_URL', 'http://product-service:3001');
    }

    public function getProductById($productId)
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/products/{$productId}");

            if ($response->status() === 404) {
                return null;
            }

            if ($response->successful()) {
                return $response->json('data');
            }

            throw new \Exception('Unexpected HTTP status ' . $response->status());
        } catch (\Exception $e) {
            throw new ExternalServiceException('Product service tidak dapat dihubungi, coba lagi nanti', 0, $e);
        }
    }
}
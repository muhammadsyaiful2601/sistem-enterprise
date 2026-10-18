<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use UnexpectedValueException;

class ProductService
{
    public function getProduct(int $productId): ?array
    {
        $response = Http::baseUrl(config('services.product.url'))
            ->connectTimeout(3)
            ->timeout(5)
            ->get("/products/{$productId}");

        if ($response->status() === 404) {
            return null;
        }

        $response->throw();

        $product = $response->json('data');

        if (! is_array($product)) {
            throw new UnexpectedValueException('Product Service returned an invalid product response.');
        }

        return $product;
    }
}

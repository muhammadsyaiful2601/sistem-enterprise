<?php

namespace Tests\Feature;

use App\Services\ProductService;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.product.url', 'http://product-service.test');
    }

    public function test_it_returns_product_data_from_the_product_service(): void
    {
        $product = ['id' => 17, 'name' => 'Webcam'];
        Http::fake([
            'product-service.test/products/17' => Http::response(['data' => $product]),
        ]);

        $result = app(ProductService::class)->getProduct(17);

        $this->assertSame($product, $result);
        Http::assertSent(fn (Request $request) => $request->url() === 'http://product-service.test/products/17');
    }

    public function test_it_returns_null_when_the_product_does_not_exist(): void
    {
        Http::fake([
            'product-service.test/products/404' => Http::response(['message' => 'Product tidak ditemukan'], 404),
        ]);

        $this->assertNull(app(ProductService::class)->getProduct(404));
    }

    public function test_it_does_not_treat_product_service_failures_as_missing_products(): void
    {
        Http::fake([
            'product-service.test/products/17' => Http::response(['message' => 'Unavailable'], 503),
        ]);

        $this->expectException(RequestException::class);

        app(ProductService::class)->getProduct(17);
    }
}

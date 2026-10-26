<?php
namespace App\Clients;

use Iluminate\Support\Facedes\Http;
use App\Exceptions\ExternalServiceException;

class ProductServiceClient
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('PRODUCT_SERVICE_URL');
    }

    public function getProductById($productId)
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/priducts/{$productId}");

            if ($response->status() === 404) {
                return null; 
            }

            if ($response->successfull()) {
                return $response->json('data');
            }
            
            throw new \Exception('Unexpected http status '. $response->status());
        } catch (\Exception $e) {
            throw new ExternalServiceException('Product service tidak dapat dihubungi , coba lagi nanti', 0, $e);
            
         }
    }

}
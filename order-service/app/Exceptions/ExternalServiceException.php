<?php

namespace App\Exceptions;

use Exception;

class ExternalServiceException extends Exception
{
    public function render($request)
    {
        $response = ['message' =>  $this ->getMessage()];
       
        if (config('app.debug')) {
            $response['debug'] = $this->getPrevious() ? $this->getPrevious()->getMessage() : 'Timeout atau koneksi terputus'
        }
        return response()->json($response, 500);
    }
}
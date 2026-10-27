<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Models;
class Order extends Model
{
    use Hasfactory;

    protected $fillable = [
        'user_id',
        'status',
        'total_amount',

    ];

    public function orderItems()
    {
        return $this->hashMany(Orderitem::class, 'order_id');
    }
}

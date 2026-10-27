<?php

namespace App\Models;

use Iluminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'quantity',
        'subtotal',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

}

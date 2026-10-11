<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    // Kolom yang boleh diisi massal (pengaman mass assignment).
    protected $fillable = ['user_id', 'product_id', 'quantity'];

    // Dipakai sebagai CartItem::forUser($id)->get(). Terbaru di atas.
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)->latest();
    }
}
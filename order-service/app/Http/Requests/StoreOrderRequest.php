<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Field user_id wajib diisi.',
            'user_id.integer' => 'Field user_id harus berupa angka.',
        ];
    }
}

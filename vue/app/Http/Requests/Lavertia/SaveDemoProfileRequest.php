<?php

declare(strict_types=1);

namespace App\Http\Requests\Lavertia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveDemoProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'display_name' => ['required', 'string', 'max:100'],
            'role' => ['required', Rule::in(['owner', 'editor'])],
            'bio' => ['nullable', 'string', 'max:1000'],
            'notify' => ['required', 'boolean'],
        ];
    }
}

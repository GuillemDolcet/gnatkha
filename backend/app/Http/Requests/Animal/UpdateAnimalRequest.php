<?php

namespace App\Http\Requests\Animal;

use App\Http\Requests\BaseRequest;

class UpdateAnimalRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('animal'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:255'],
            'animal_type_id' => ['required', 'integer', 'exists:animal_types,id'],
            'breed' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'sex' => ['nullable', 'in:male,female,unknown'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'chip_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'default_image_id' => ['nullable', 'integer', 'exists:default_animal_images,id'],
        ];
    }
}

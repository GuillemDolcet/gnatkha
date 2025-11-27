<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BaseRequest extends FormRequest
{
    /**
     * Override the failed validation response.
     *
     * This will return a JSON response with:
     * - code: short identifier for the field and rule (e.g., email_required)
     * - message: descriptive error message
     *
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = [];
        $failedRules = $validator->failed();
        $allErrors = $validator->errors()->toArray();

        foreach ($allErrors as $field => $messages) {
            foreach ($messages as $index => $message) {
                // Check if this error came from a standard validation rule
                if (isset($failedRules[$field])) {
                    $rules = array_keys($failedRules[$field]);
                    $rule = $rules[$index] ?? $rules[0] ?? 'invalid';
                    $code = strtolower($field) . '_' . strtolower($rule);
                } else {
                    // Manual error added via $validator->errors()->add()
                    // The message itself is the code (e.g., 'already_member')
                    $code = $message;
                }

                $errors[$field][] = [
                    'code' => $code,
                    'message' => $message,
                ];
            }
        }

        throw new HttpResponseException(response()->json([
            'errors' => $errors,
        ], 422));
    }
}

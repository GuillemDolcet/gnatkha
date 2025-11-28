<?php

namespace App\Concerns\Contracts;

use Illuminate\Http\UploadedFile;

interface FileStorageInterface
{
    /**
     * Store a file and return its path.
     */
    public function store(UploadedFile $file, string $directory): string;

    /**
     * Delete a file by its path.
     */
    public function delete(string $path): bool;

    /**
     * Get the public URL for a file.
     */
    public function url(string $path): string;
}

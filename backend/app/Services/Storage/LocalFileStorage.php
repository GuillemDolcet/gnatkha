<?php

namespace App\Services\Storage;

use App\Concerns\Contracts\FileStorageInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class LocalFileStorage implements FileStorageInterface
{
    protected string $disk;

    public function __construct(string $disk = 'public')
    {
        $this->disk = $disk;
    }

    /**
     * Store a file and return its path.
     */
    public function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, $this->disk);
    }

    /**
     * Delete a file by its path.
     */
    public function delete(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }

    /**
     * Get the public URL for a file.
     */
    public function url(string $path): string
    {
        return Storage::disk($this->disk)->url($path);
    }
}

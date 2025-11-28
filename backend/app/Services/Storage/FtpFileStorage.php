<?php

namespace App\Services\Storage;

use App\Concerns\Contracts\FileStorageInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FtpFileStorage implements FileStorageInterface
{
    protected string $disk;
    protected string $baseUrl;

    public function __construct(string $disk = 'ftp', ?string $baseUrl = null)
    {
        $this->disk = $disk;
        $this->baseUrl = $baseUrl ?? config('filesystems.disks.ftp.url', '');
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
        return rtrim($this->baseUrl, '/') . '/' . ltrim($path, '/');
    }
}

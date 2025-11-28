<?php

namespace App\Providers;

use App\Concerns\Contracts\FileStorageInterface;
use App\Services\Storage\FtpFileStorage;
use App\Services\Storage\LocalFileStorage;
use Illuminate\Support\ServiceProvider;

class FileStorageServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(FileStorageInterface::class, function ($app) {
            $driver = config('filesystems.default');

            return match ($driver) {
                'ftp' => new FtpFileStorage(),
                default => new LocalFileStorage(),
            };
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

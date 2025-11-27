<?php

use App\Http\Controllers\Api\PackController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('packs')->group(function () {

    Route::get('/', [PackController::class, 'index'])
        ->name('packs.index');

    Route::post('/', [PackController::class, 'store'])
        ->name('packs.store');

    Route::post('/join', [PackController::class, 'join'])
        ->name('packs.join');

    Route::get('/{pack}', [PackController::class, 'show'])
        ->name('packs.show');

    Route::put('/{pack}', [PackController::class, 'update'])
        ->name('packs.update');

    Route::delete('/{pack}', [PackController::class, 'destroy'])
        ->name('packs.destroy');

    Route::post('/{pack}/leave', [PackController::class, 'leave'])
        ->name('packs.leave');

    Route::get('/{pack}/members', [PackController::class, 'members'])
        ->name('packs.members');

    Route::delete('/{pack}/members/{user}', [PackController::class, 'removeMember'])
        ->name('packs.members.remove');

    Route::post('/{pack}/members/{user}/transfer-admin', [PackController::class, 'transferAdmin'])
        ->name('packs.members.transfer-admin');
});

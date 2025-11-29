<?php

use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AnimalTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Animal types (public list)
    Route::get('animal-types', [AnimalTypeController::class, 'index'])
        ->name('animal-types.index');

    // Animals CRUD
    Route::get('animals', [AnimalController::class, 'all'])
        ->name('animals.all');

    Route::get('packs/{pack}/animals', [AnimalController::class, 'index'])
        ->name('animals.index');

    Route::post('animals', [AnimalController::class, 'store'])
        ->name('animals.store');

    Route::get('animals/{animal}', [AnimalController::class, 'show'])
        ->name('animals.show');

    Route::post('animals/{animal}', [AnimalController::class, 'update'])
        ->name('animals.update');

    Route::delete('animals/{animal}', [AnimalController::class, 'destroy'])
        ->name('animals.destroy');
});

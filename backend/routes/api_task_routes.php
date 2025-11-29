<?php

use App\Http\Controllers\Api\PushSubscriptionController;
use App\Http\Controllers\Api\ReminderController;
use App\Http\Controllers\Api\TaskLogController;
use App\Http\Controllers\Api\TaskTypeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Task Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Task Types
    Route::get('/task-types', [TaskTypeController::class, 'index']);

    // Reminders
    Route::get('/animals/{animal}/reminders', [ReminderController::class, 'indexForAnimal']);
    Route::get('/packs/{pack}/reminders', [ReminderController::class, 'indexForPack']);
    Route::get('/reminders/upcoming', [ReminderController::class, 'upcoming']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::get('/reminders/{reminder}', [ReminderController::class, 'show']);
    Route::put('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy']);
    Route::post('/reminders/{reminder}/toggle', [ReminderController::class, 'toggle']);

    // Task Logs
    Route::get('/animals/{animal}/logs', [TaskLogController::class, 'indexForAnimal']);
    Route::get('/animals/{animal}/logs/recent', [TaskLogController::class, 'recentForAnimal']);
    Route::get('/animals/{animal}/logs/stats', [TaskLogController::class, 'stats']);
    Route::get('/packs/{pack}/logs', [TaskLogController::class, 'indexForPack']);
    Route::get('/logs/today', [TaskLogController::class, 'today']);
    Route::post('/logs', [TaskLogController::class, 'store']);
    Route::get('/logs/{taskLog}', [TaskLogController::class, 'show']);
    Route::put('/logs/{taskLog}', [TaskLogController::class, 'update']);
    Route::delete('/logs/{taskLog}', [TaskLogController::class, 'destroy']);

    // Push Subscriptions
    Route::get('/push/vapid-public-key', [PushSubscriptionController::class, 'vapidPublicKey']);
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'store']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'destroy']);
});

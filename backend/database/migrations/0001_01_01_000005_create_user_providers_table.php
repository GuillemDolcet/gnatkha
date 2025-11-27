<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_social_providers', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('social_provider_id')->constrained()->onDelete('cascade');
            $table->string('social_provider_account_id');
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->text('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['social_provider_id', 'social_provider_account_id']);
            $table->unique(['user_id', 'social_provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_social_providers');
    }
};

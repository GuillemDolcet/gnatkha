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
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('frequency', ['once', 'daily', 'weekly', 'monthly'])->default('once');

            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->unsignedTinyInteger('day_of_month')->nullable();
            $table->time('time_of_day');

            // Para recordatorios únicos
            $table->date('specific_date')->nullable();

            // Estado
            $table->boolean('is_active')->default(true);
            $table->timestamp('next_occurrence')->nullable();

            $table->timestamps();

            $table->index(['is_active', 'next_occurrence']);
            $table->index(['animal_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};

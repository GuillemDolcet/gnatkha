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
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('animal_type_id')->constrained('animal_types')->onDelete('restrict');
            $table->foreignId('pack_id')->constrained('packs')->onDelete('cascade');
            $table->string('breed')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('sex', ['male', 'female', 'unknown']);
            $table->decimal('weight', 6, 2)->nullable();
            $table->string('chip_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('image_path')->nullable();
            $table->foreignId('default_image_id')->nullable()->constrained('default_animal_images')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};

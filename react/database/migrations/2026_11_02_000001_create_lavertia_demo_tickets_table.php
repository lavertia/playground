<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lavertia_demo_tickets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('team_id')->nullable()->index();
            $table->string('title', 160);
            $table->string('status', 16)->default('draft');
            $table->timestamps();

            $table->index(['owner_id', 'team_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lavertia_demo_tickets');
    }
};

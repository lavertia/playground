<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lavertia_demo_posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['team_id', 'slug']);
            $table->index(['team_id', 'status', 'id']);
            $table->index(['team_id', 'featured']);
            $table->index(['team_id', 'sort_order']);
        });

        Schema::create('lavertia_demo_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('brand');
            $table->string('sku', 64);
            $table->boolean('visibility')->default(true);
            $table->boolean('featured')->default(false);
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedTinyInteger('thumbnail')->default(0);
            $table->timestamps();

            $table->unique(['team_id', 'slug']);
            $table->unique(['team_id', 'sku']);
            $table->index(['team_id', 'brand', 'id']);
            $table->index(['team_id', 'visibility']);
        });

        Schema::create('lavertia_demo_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('number', 32);
            $table->string('customer');
            $table->string('status', 20);
            $table->decimal('total_price', 12, 2);
            $table->decimal('shipping_cost', 12, 2);
            $table->date('order_date');
            $table->timestamps();

            $table->unique(['team_id', 'number']);
            $table->index(['team_id', 'status', 'id']);
            $table->index(['team_id', 'order_date', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lavertia_demo_orders');
        Schema::dropIfExists('lavertia_demo_products');
        Schema::dropIfExists('lavertia_demo_posts');
    }
};

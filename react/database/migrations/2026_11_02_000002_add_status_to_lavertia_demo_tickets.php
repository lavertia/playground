<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lavertia_demo_tickets', function (Blueprint $table): void {
            $table->string('status', 16)->default('draft');
            $table->index(['owner_id', 'team_id', 'status'], 'lavertia_tickets_owner_team_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('lavertia_demo_tickets', function (Blueprint $table): void {
            $table->dropIndex('lavertia_tickets_owner_team_status_idx');
            $table->dropColumn('status');
        });
    }
};

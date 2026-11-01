<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shows the registered admin panel links in the existing host sidebar', function (): void {
    $expected = count(app(\Lavertia\Panels\PanelRegistry::class)->navigation('admin', 'lavertia.admin.dashboard'));
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->has('lavertia.navigation', $expected)
            ->has('lavertiaSidebar', $expected)
            ->where('lavertiaSidebar.0.slug', 'dashboard')
            ->where('lavertiaSidebar.0.active', true)
            ->where('lavertiaSidebar.0.url', '/admin/dashboard')
            ->where('lavertiaSidebar.0.icon', 'layout-dashboard')
            ->where('lavertiaSidebar.0.badge', null)
            ->where('lavertiaSidebarDirection', 'ltr')
            ->where('lavertiaPanel.id', 'admin')
            ->where('lavertiaPanel.brandName', 'Lavertia')
            ->where('lavertiaPanel.brandSubtitle', 'Playground')
            ->where('lavertiaPanel.primaryColor', '#f59e0b')
            ->where('lavertiaPanel.sidebarVariant', 'inset')
            ->where('lavertiaSidebar.1.badge', 'New')
            ->where('lavertiaPanel.globalSearch', true)
            ->where('lavertiaPanel.notifications', true)
            ->where('lavertiaPanel.tenantSwitcher', true)
            ->where('lavertiaPanel.footerLinks.0.label', 'Source repository')
            ->where('lavertiaPanel.userMenuLinks.0.label', 'Lavertia documentation')
            ->etc());
});

it('does not expose authenticated panel links to guests', function (): void {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebar', [])
            ->where('lavertiaPanel', null)
            ->etc());
});

it('resolves Arabic RTL on the first response for host and Lavertia Page', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebarDirection', 'rtl')
            ->where('lavertia.direction', 'rtl')
            ->etc());
});

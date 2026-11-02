<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shows the registered admin panel links in the existing host sidebar', function (): void {
    $this->actingAs(User::factory()->create());

    // Resource navigation is Policy-aware: compute expected links as
    // the same authenticated user who will render the sidebar.
    $expected = count(app(\Lavertia\Panels\PanelRegistry::class)->navigation('admin', 'lavertia.admin.dashboard'));

    $this->get('/admin/dashboard')
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
            ->where('lavertiaPanel.theme.id', 'playground')
            ->where('lavertiaPanel.layout', 'sidebar')
            ->where('lavertiaPanel.languageSwitcher', true)
            ->where('lavertiaPanel.locale', 'en')
            ->where('lavertiaPanel.supportedLocales', ['en', 'ar', 'fr'])
            ->where('lavertiaPanel.brandName', 'Lavertia')
            ->where('lavertiaPanel.brandSubtitle', 'Playground')
            ->where('lavertiaPanel.primaryColor', '#f59e0b')
            ->where('lavertiaPanel.sidebarVariant', 'inset')
            ->where('lavertiaSidebar.3.badge', 'New')
            ->where('lavertiaSidebar.3.parentSlug', 'reports')
            ->where('lavertiaPanel.navigationGroups.1.collapsible', true)
            ->where('lavertiaPanel.navigationGroups.1.collapsedByDefault', true)
            ->where('lavertiaPanel.globalSearch', true)
            ->where('lavertiaPanel.notifications', true)
            ->where('lavertiaPanel.tenantSwitcher', true)
            ->where('lavertiaPanel.footerLinks.0.label', 'Source repository')
            ->where('lavertiaPanel.userMenuLinks.0.label', 'Lavertia documentation')
            ->etc());
});

it('serializes Reports PageHeader breadcrumb tabs and Action', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/reports')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.tabs.0.label', 'Overview')
            ->where('lavertia.tree.components.0.props.breadcrumbs.0.url', '/admin/dashboard')
            ->has('lavertia.tree.components.0.components', 1)
            ->etc());
});

it('allows a Page to override navigation into top or full shell layouts', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/reports')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaPanel.layout', 'top')
            ->where('lavertiaPanel.navigationPosition', 'top')
            ->etc());

    $this->actingAs($user)
        ->get('/admin/fullscreen-demo?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaPanel.layout', 'full')
            ->where('lavertiaPanel.navigationPosition', 'none')
            ->where('lavertiaPanel.supportedLocales', ['en', 'ar'])
            ->where('lavertiaPanel.languageSwitcher', true)
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.direction', 'rtl')
            ->etc());
});

it('uses authorized portable navigation components in several shell locations', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/workspace-demo')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaPanel.layout', 'workspace')
            ->where('lavertiaPanel.shellSlots.0.type', 'navigation-slot')
            ->where('lavertiaPanel.shellSlots.0.props.position', 'topbar')
            ->where('lavertiaPanel.shellSlots.0.components.0.props.url', '/admin/workspace-demo')
            ->where('lavertiaPanel.shellSlots.2.props.position', 'context')
            ->where('lavertiaPanel.shellSlots.2.components.0.type', 'navigation-group')
            ->where('lavertiaPanel.shellSlots.2.components.0.components.0.props.url', '/admin/fullscreen-demo')
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
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebarDirection', 'rtl')
            ->where('lavertiaPanel.locale', 'ar')
            ->where('lavertiaPanel.direction', 'rtl')
            ->where('lavertia.direction', 'rtl')
            ->etc());
});

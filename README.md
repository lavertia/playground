# Lavertia Playground

Three official Laravel 13 / Inertia 3 Starter Kit applications test the **same PHP-defined Lavertia component tree** using React, Vue and Svelte.

| Stack | Directory | Local URL |
| --- | --- | --- |
| React 19 | [react](react/) | http://127.0.0.1:8002/admin/dashboard |
| Vue 3 | [vue](vue/) | http://127.0.0.1:8001/admin/dashboard |
| Svelte 5 | [svelte](svelte/) | http://127.0.0.1:8003/admin/dashboard |

Each Starter Kit owns its normal Laravel authentication, Teams support, session and UI shell. Lavertia provides a PHP-first component protocol and adapters, with an amber-accent, Filament-inspired dashboard showcase.

## Local setup

Clone the public Lavertia repositories as **siblings**. The Composer path repositories in the applications rely on this layout:

```text
24- Lavertia/
├── playground/
│   ├── react/
│   ├── vue/
│   └── svelte/
├── panels/
└── support/
```

Use `support` on `main` and the tested Panels `main` branch, or a matching unmerged feature branch during development. Version tags and Packagist publishing are separate release gates.

Each Laravel app resolves `lavertia/panels` and `lavertia/support` from `../../panels` and `../../support`. Install and configure separately:

```bash
for stack in vue react svelte; do
  (
    cd "$stack" || exit 1
    composer install
    npm ci
    test -f .env || cp .env.example .env
    php artisan key:generate
    php artisan migrate
    npm run build
  ) || break
done
```

Run in separate terminal windows from the repository root:

```bash
(cd vue && php artisan serve --port=8001)
(cd react && php artisan serve --port=8002)
(cd svelte && php artisan serve --port=8003)
```

These are three **independent** applications. Use unique session cookies in each `.env` because cookies are shared across ports on the same host:

```text
vue:    SESSION_COOKIE=lavertia_vue_session
react:  SESSION_COOKIE=lavertia_react_session
svelte: SESSION_COOKIE=lavertia_svelte_session
```

For stronger cookie and CSRF isolation, use distinct local domains through Herd or Valet. Configure each app's `APP_URL` to its actual host/port. Register or sign in to each Starter Kit before opening `/admin/dashboard`.

## Automatic PHP refresh during development

Run `npm run dev` **inside** the React, Vue or Svelte Starter Kit while its Laravel app is running. All three `vite.config.ts` files now watch:

- `app/**/*.php`: PHP Pages, Widgets, controllers and other application code.
- `app-modules/*/src/**/*.php`: Composer-backed Laravel modules, including `internachi/modular` Pages.
- Default Laravel watch areas: views, translations and routes.

Saving one of those files triggers a **Vite full-browser refresh**, so the browser fetches a freshly rendered Inertia component tree from Laravel. JavaScript/TypeScript and CSS retain their existing Vite HMR behavior. This is **not** server-side PHP runtime hot swapping or partial Inertia state preservation.

For a module in a custom directory, extend the `refresh` paths in that Starter Kit's `vite.config.ts`. Changes to module discovery, Composer autoload or provider registration may also require `composer dump-autoload` and `php artisan optimize:clear`. Never run the Vite development server in production.

## Current dashboard

- PHP `PageHeader`, `StatsGrid`, `Stat`, `Section`, `Card`, `Table`, `TextColumn`, `Infolist`, `TextEntry`, `TextInput` and `Action` compose freely.
- Matching React/Vue/Svelte renderers use Tailwind 4, semantic HTML, light/dark mode and keyboard focus styles.
- Search and sorting work **locally** on the example table's 100-row maximum snapshot, with badge statuses and no server round trips.
- The form field has local state **only**: no submit endpoint, persistence or Eloquent CRUD exists yet.
- Dataset and KPI cards contain sample values **for layout testing**, not application analytics.

## CI

The workflow is located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) in this repository's root. Nested Starter Kit workflow files in `react/.github`, `vue/.github` and `svelte/.github` are examples only.

- **Static validation** checks the three source applications.
- **Laravel integration** checks out public Support and Panels packages, runs Laravel/Pest tests, TypeScript checks, and production builds for React, Vue and Svelte.
- **Release verification** refuses to treat skipped integration suites as successes. The complete source suite is regularly verified on GitHub Actions.
- No private repository read token is required now that all source repositories are public. Use default read-only `GITHUB_TOKEN` checkout credentials.
- `LAVERTIA_SUPPORT_REF` and `LAVERTIA_PANELS_REF` variables may select paired branches for in-progress integration work.

Never commit `.env`, session cookies, databases or private keys. Local Composer path versions are intentionally experimental; replace them with versioned Composer releases only after the project's release gate approves tags.

## Reusing the panels design in a Starter Kit

The versioned source of the frontend adapters is [lavertia/panels](https://github.com/lavertia/panels). When a renderer changes, the installed copies inside the Playground must be synchronized; after reviewing local changes, rerun `php artisan lavertia:install --stack=<react|vue|svelte> --force` inside the target app and rebuild assets.

The design is inspired by admin UI layout conventions, but uses Lavertia's own PHP components and styling. It is not a Filament fork or drop-in replacement.

## Open-source alpha security and license

Report security vulnerabilities privately using [SECURITY.md](SECURITY.md). Lavertia-owned integration/example code is MIT licensed ([LICENSE.md](LICENSE.md)); upstream Laravel Starter Kits and dependencies retain their own licenses. Refer to the [release checklist](https://github.com/lavertia/lavertia/issues/3).

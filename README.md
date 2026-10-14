# Lavertia Playground

Three official Laravel 13 / Inertia 3 Starter Kit applications test the **same PHP-defined Lavertia component tree** using React, Vue and Svelte.

| Stack | Directory | Local URL |
| --- | --- | --- |
| React 19 | [react](react/) | http://127.0.0.1:8002/admin/dashboard |
| Vue 3 | [vue](vue/) | http://127.0.0.1:8001/admin/dashboard |
| Svelte 5 | [svelte](svelte/) | http://127.0.0.1:8003/admin/dashboard |

Each Starter Kit owns its normal Laravel authentication, Teams support, session and UI shell. Lavertia provides a PHP-first component protocol and adapters, with an amber-accent, Filament-inspired dashboard showcase.

## Local setup

Clone three separate private repositories as **siblings**. The Composer path repositories in the applications rely on this layout:

```text
24- Lavertia/
├── playground/
│   ├── react/
│   ├── vue/
│   └── svelte/
├── panels/
└── support/
```

Use matching feature branches while PRs are still open:

```bash
git -C support switch feat/component-protocol-v1
git -C panels switch feat/filament-inspired-composable-ui
```

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

## Current dashboard

- PHP `PageHeader`, `StatsGrid`, `Stat`, `Section`, `Card`, `Table`, `TextColumn`, `Infolist`, `TextEntry`, `TextInput` and `Action` compose freely.
- Matching React/Vue/Svelte renderers use Tailwind 4, semantic HTML, light/dark mode and keyboard focus styles.
- Search and sorting work **locally** on the example table's 100-row maximum snapshot, with badge statuses and no server round trips.
- The form field has local state **only**: no submit endpoint, persistence or Eloquent CRUD exists yet.
- Dataset and KPI cards contain sample values **for layout testing**, not application analytics.

## CI

The workflow is located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) in this repository's root. Nested Starter Kit workflow files in `react/.github`, `vue/.github` and `svelte/.github` are examples only; GitHub does not automatically run them as workflows of the parent repository.

- **Static job** runs without extra private-repository permissions.
- **Integration job** clones the sibling private `lavertia/support` and `lavertia/panels` repositories and executes Laravel/Pest, frontend typecheck and production build for each stack.
- **Required organization/repository secret:** `LAVERTIA_READ_TOKEN`, a **read-only fine-grained GitHub token** with Contents: Read permissions on `lavertia/support` and `lavertia/panels`. Configure it in `lavertia/playground` repository Actions secrets (or expose an organization secret to this repo).
- Until the secret exists, the integration matrix is deliberately **skipped** with a notice rather than falsely claimed to be tested. Check the GitHub Actions job list.
- Optional repository variables `LAVERTIA_SUPPORT_REF` and `LAVERTIA_PANELS_REF` override branch references. Point both to stable tags or `main` when the packages are merged/released.

Never commit `.env`, session cookies, databases or private keys. Local Composer path versions are intentionally experimental; replace them with tagged Composer dependencies before public package releases.

## Reusing the panels design in a Starter Kit

The versioned source of the frontend adapters is [lavertia/panels](https://github.com/lavertia/panels). When a renderer changes, the installed copies inside the Playground must be synchronized; after reviewing local changes, rerun `php artisan lavertia:install --stack=<react|vue|svelte> --force` inside the target app and rebuild assets.

The design is inspired by admin UI layout conventions, but uses Lavertia's own PHP components and styling. It is not a Filament fork or drop-in replacement.

# Lavertia Playground

Three independent Laravel 13 + Inertia Starter Kit applications for validating the [Lavertia](https://github.com/lavertia/lavertia) PHP-first component protocol on **React**, **Vue**, and **Svelte**.

| Stack | Directory |
| --- | --- |
| React 19 | [react](react/) |
| Vue 3 | [vue](vue/) |
| Svelte 5 | [svelte](svelte/) |

> **Alpha development fixture, not a production app or stable distribution.** The default branch contains the Starter Kit snapshots. Lavertia-specific work remains in draft pull requests.

## Work in progress

- [PR #1 — UI renderer showcase](https://github.com/lavertia/playground/pull/1)
- [PR #2 — authenticated forms, tables and integration scenarios](https://github.com/lavertia/playground/pull/2)
- [PR #4 — canonical Forms/Tables package compatibility](https://github.com/lavertia/playground/pull/4)

The same PHP component tree must render consistently across all three stacks. End-to-end Laravel/Pest tests require `lavertia/support`, `lavertia/panels`, `lavertia/forms` and `lavertia/tables` checked out as sibling repositories on compatible feature refs while these PRs are unmerged. The CI integration matrix is **not verified** while the dependency access gate is skipped.

Each app is a separate Laravel installation and must generate its own local `.env` and `APP_KEY`. Never publish `.env`, database files, access tokens, cookies or real customer data.

## Development and verification

From the chosen `react/`, `vue/` or `svelte/` directory, after the matching repositories are available:

```bash
composer install
npm ci
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan test
npm run types:check
npm run build
```

If any of those commands fail, do not claim that stack is compatible. `composer install` may require a lockfile refresh and matching sibling package versions during pre-release development.

## Security and licensing

Report vulnerabilities privately via [SECURITY.md](SECURITY.md). The Lavertia integration/example code is MIT licensed; see [LICENSE.md](LICENSE.md). The Laravel Starter Kit, framework, and JavaScript dependencies retain their own copyright notices and licenses. This repository does not claim ownership of those upstream components.

# Lavertia Classic Theme (portable package)

This directory is a **standalone Composer package** with PSR-4 autoloading,
its own package name, and a stable PanelTheme contract. It currently lives
inside lavertia/playground because the connected GitHub integration cannot
create new repositories. Extract this folder unchanged into
lavertia/theme-default before Packagist publication.

## Usage

```php
use Lavertia\ThemeDefault\ClassicTheme;
return $panel->theme(new ClassicTheme);
```

Configure a Composer path repository to themes/default for local development;
once the standalone GitHub repo exists, use a versioned VCS/Packagist dependency.

To fork: rename the Composer name and namespace, update theme ID and palette.
Only allowlisted color variables with 6-digit hexadecimal values are accepted.
No arbitrary CSS/HTML/JS is injected through the server-provided manifest.
Theme assets, alternative shell layouts and custom widget renderers are
explicit frontend extension points and must be audited per adapter.

Laravel policies, tenancy isolation, routing and accessibility cannot be
disabled by a theme. RTL is inherited from the server-resolved locale.

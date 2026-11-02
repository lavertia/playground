# Theme packages in Lavertia

A **theme package is optional**. Panels uses its native CSS when no theme is supplied.
Any Composer package implementing `Lavertia\Panels\Themes\PanelTheme` may
be selected using `$panel->theme(new VendorTheme)`. Only allowlisted color
tokens are transported to the Inertia client; route authorization and tenant
data never belong to a theme.

## Layout and renderer support

The React, Vue and Svelte hosts read the same theme ID and token manifest.
A theme may provide companion CSS and licensed imagery as frontend assets,
but the current P0-04 implementation **does not** install arbitrary theme
JavaScript or override host components. Native renderer extension registries,
multi-mode palettes, typography tokens and an interactive theme preview are
tracked in lavertia/panels#28.

## Theme package repository

The default theme has been transferred to
[lavertia/theme_default](https://github.com/lavertia/theme_default)
(Composer package name: `lavertia/theme-default`).

The standalone repository now owns its Composer manifest, PHP theme class,
license, documentation and CI. The previous `themes/default` directory in
Playground is retired, so changes must be made in the theme repository.

The repository is currently private; Packagist publication and compatibility
with an officially tagged Panels P0-04 release are not yet complete.

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

## Publishing

`themes/default` is a portable Composer package. It currently lives here
because creation of the intended standalone `lavertia/theme-default`
repository is not available via the current connected GitHub tool.
To publish, extract it into that dedicated repo, add independent CI/semver
and register it on Packagist. Do not claim it is hosted separately yet.

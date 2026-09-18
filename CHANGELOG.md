# SD Bridge — Changelog

## v0.19.0

### New
- Custom dark WPF window chrome with SD Bridge branding.
- WPF window position, size, and maximized state are restored between launches.
- Final SD Bridge logo integrated across the WPF, Stream Deck companion plugin, and documentation site.

### Update
- Companion Stream Deck plugin version bumped to `1.19.0.x`.
- Plugin/action icons and website branding now use the final SD Bridge identity.
- Documentation site and download references updated for v0.19.0.
- Official `SD-Bridge-v0.19.0.sb` Streamer.bot action export is now bundled in the package and wired to the documentation download button.
- Installation documentation now distinguishes the Stream Deck plugin confirmation from the separate preconfigured profile installation prompt.
- Documentation demo video is now bundled with the site and opens in the existing in-page modal.
- Readable branding sources added to the public package.
- Official SD Bridge logo locked as the canonical branding asset and applied everywhere without further visual alteration.
- Branding source set now includes the official `PNG`, `SVG`, and Windows `ICO` formats.
- WPF title-bar logo rendering now decodes at small-icon scale to preserve cleaner edges.
- WPF dark surfaces now match Streamer.bot exactly: `#202020` chrome/background, `#272727` panels, and `#323232` content/controls.
- WPF title bar now uses the same background as the main window for a seamless Streamer.bot-style surface.
- WPF outer chrome now uses rounded corners to match the visual form factor of the surrounding desktop apps.

### Fix
- Removed the white native WPF title bar that broke the dark UI consistency.
- Setup and validation keep the same WPF placement during the workflow.
- Saved WPF placement is ignored safely when it is no longer visible on the current desktop layout.
- Removed the visible color break between the custom title bar and the WPF body.
- Removed all remaining previous logo variants from the WPF, Stream Deck plugin assets, and documentation site.
- Reduced the WPF title-bar logo size and improved its rendering to better match Streamer.bot and Stream Deck.
- Demo playback now starts immediately when `Watch demo` is clicked.

## v0.18.0

### New
- Diagnostic report after failed validation.
- Command expiration to prevent stale switches.
- Corrupted state recovery.
- Transactional profile backup and rollback.

### Update
- Bridge aliases are preserved and recovered.
- State writes are now atomic.
- Build number recovery hardened.
- WebSocket runtime hardened.
- Multi-device ambiguity is detected explicitly.

### Fix
- Fixed aliases being lost after rebuild.
- Fixed stable Bridge keys being silently changed.
- Fixed cleanup across different drives.
- Fixed partial cleanup failures.
- Fixed stale commands executing after restart.

## v0.17.1 — Diagnostics

### New
- Failure questionnaire after validation.
- Automatic support report generated on Desktop.

### Update
- Validation profile selected automatically when no Bridge is installed.
- Validation detection now prioritizes the actual installed state.

### Fix
- Removed remaining French UI messages.
- Replaced Windows-localized Yes/No dialogs.

## v0.17.0

### New
- `Copy name` button for Bridge profiles.
- Community testing package.
- Developer-readable sources.

### Update
- Page can be selected by name or number.
- UI/documentation added.

### Fix
- Version inconsistencies cleaned up.

## v0.16.0

### New
- `Clean / Rebuild state` tool.
- Automatic state backup before rebuilding.

### Update
- State reconstructed from live Bridge profiles and installed configuration.
- Alias history compacted.

### Fix
- Removed recoverable duplicate and orphaned state entries.

## v0.15.0

### New
- Rename-safe Bridge recovery.
- Bridge name aliases.

### Update
- Installed `bridge-config.json` used for identity recovery.

### Fix
- Renaming a `[Bridge]` profile no longer breaks existing actions.
- Fixed duplicate logical identities after rename.

## v0.14.0

### New
- Persistent validation status.

### Update
- Validation profile now has Recommended, Installed and Optional states.

### Fix
- Validation profile no longer gets unnecessarily proposed again.

## v0.13.0

### New
- Multi-device Stream Deck support.

### Update
- Real `DeviceType` preserved through profile, state, manifest and runtime.

### Fix
- Removed XL-only runtime restriction.
- Prevented fallback to the wrong Stream Deck type.

## v0.12.0

### New
- Portable SD Bridge state storage.
- Automatic migration from legacy `%APPDATA%` state.

### Update
- SD Bridge data now follows the Streamer.bot installation.

### Fix
- Removed dependency on a fixed Streamer.bot AppData location.

## v0.11.0

### New
- Persistent Bridge marker.
- Stable `bridgeKey`.
- Persistent Bridge identity.

### Update
- Bridge identity separated from display name.

### Fix
- Prevented `[Bridge] [Bridge]` duplication.
- Setup can safely be run multiple times.

## v0.10.0

### New
- Integrated profile cleanup.
- Automatic safety backups.
- Setup window auto-scroll.

### Update
- Setup, validation and cleanup merged into the main Core.

### Fix
- Improved profile removal workflow.

## v0.9.0

### New
- Automatic Stream Deck shutdown/restart during profile maintenance.

### Update
- Cleanup process became mostly automatic.

### Fix
- Reduced profile modifications while Stream Deck is actively using them.

## v0.8.0

### New
- Dedicated 10-page validation profile.
- Automated Bridge/profile/page validation workflow.

### Update
- Validation profile became a real installation test instead of a simple example.

## v0.7.0

### New
- Page selection by number.
- Page selection by name.

### Update
- Runtime page resolution improved.

### Fix
- Invalid page numbers are rejected.

## v0.6.0

### Update
- User-facing interface standardized in English.
- Setup wording simplified.

### Fix
- Removed inconsistent prototype UI text.

## v0.5.0

### Update
- Setup WPF visual redesign.
- Buttons, spacing and panels standardized.

### Fix
- Improved setup window readability.

## v0.4.0

### New
- Dedicated WPF setup wizard.

### Update
- Profiles, Bridge profiles and validation tools separated visually.

### Fix
- Improved UI refresh after plugin generation.

## v0.3.0

### New
- Detection of existing Bridge profiles.
- Existing Bridge profiles can be reused.

### Update
- Setup and runtime usage separated more clearly.

### Fix
- Prevented unnecessary Bridge recreation.

## v0.2.0

### New
- Stream Deck XL support.
- First temporary validation profile.
- First validation workflow.
- First profile cleanup workflow.

### Update
- Bridge profiles became reusable after generation.

## v0.1.0

### New
- First SD Bridge prototype.
- Streamer.bot C# Core.
- `SetupBridge()`.
- `SwitchPage()`.
- Editable `[Bridge]` profiles.
- Direct Stream Deck profile/page switching.
- Companion architecture independent from the official Streamer.bot Stream Deck plugin.

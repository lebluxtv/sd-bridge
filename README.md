# SD Bridge

**Current version: v0.19.0**

SD Bridge lets **Streamer.bot directly switch the profile and page displayed on a Stream Deck**.

## What is it for?

Streamer.bot can interact with Stream Deck buttons, but it cannot directly control navigation between **profiles and pages**. SD Bridge adds that capability without replacing the official Streamer.bot Stream Deck plugin.

## How to use it

1. Download [**SD-Bridge-v0.19.0.sb**](./SD-Bridge-v0.19.0.sb) and import it into Streamer.bot.
2. Select `01 - Streamer.bot StreamDeck Plugin Addon - Setup Bridge`, right-click **Test**, then choose **Test Trigger**.
3. In the SD Bridge WPF window, select the Stream Deck profile(s) to bridge. On a first Stream Deck XL validation, keep **Bridge Validation Test** enabled.
4. Click **Generate plugin** / **Update plugin**. SD Bridge creates the companion `.streamDeckPlugin` package and opens it automatically.
5. Stream Deck first asks you to confirm the plugin installation. Click **Install**.
6. If the package contains preconfigured profiles — for example the recommended **Bridge Validation Test** profile — Stream Deck displays a second prompt. Click **Install Profile(s)**. The WPF watches for the imported profile copies and checks their page structure.
7. When SD Bridge reports the imported profiles as ready, click **Start test** and watch the physical Stream Deck.
8. Confirm with **Yes, everything worked**, or use **No / something was wrong** to generate a diagnostic report on the Desktop.
9. After successful validation, keep or remove the original non-bridged profiles and the temporary validation profile. **Remove now** creates a backup before removal.

The selected source profile becomes:

```text
"My Profile"
        ↓
"My Profile [Bridge]"
```

The `[Bridge]` profile then becomes your normal working profile in the Stream Deck application. Use **Copy name** whenever you need the exact value for `sdBridge.profile`.

Two example actions are included in the Streamer.bot import:

- `0x - Streamer.bot StreamDeck Plugin Addon - SwitchPage Exemple (with C#)` — edit the `profile` and `page` values in the example code.
- `0x - Streamer.bot StreamDeck Plugin Addon - SwitchPage Exemple (with Sub-Actions)` — edit the `sdBridge.profile` and `sdBridge.page` Set Argument sub-actions; the final `SwitchPage` method call does the rest.

`sdBridge.page` accepts either the exact page name or its **1-based** number.

## Tested on

**Windows 11 • Stream Deck XL • Stream Deck App v7.5.1 • Streamer.bot v1.0.7**

## Hardware support and feedback

SD Bridge has currently been physically tested on **Stream Deck XL**. If you test MK.2, Mini, +, Neo, Studio, or a multi-Stream-Deck setup, open a [GitHub Issue](https://github.com/lebluxtv/sd-bridge/issues/new/choose) and include your Stream Deck model, Stream Deck App version, Streamer.bot version, and what happened.

## If something goes wrong

- **During validation:** click **No / something was wrong**, complete the short questionnaire, then attach the `.txt` diagnostic report generated on the Desktop.
- **Elsewhere:** provide the Stream Deck model, Stream Deck App / Streamer.bot versions, and a precise description of what happened.

## Repository-ready package

This package is ready to be used as the content of the `sd-bridge` GitHub repository. The official Streamer.bot action export is included at the repository root as `SD-Bridge-v0.19.0.sb`. An identical copy is also bundled under `site/assets/` so the documentation site's download button works as a self-contained static site.

## Origin and credits

SD Bridge started from the **official Streamer.bot Stream Deck plugin** and is a community derivative/fork of that work.

The original Streamer.bot Stream Deck plugin was created by **Whipstickgostop**: https://github.com/Whipstickgostop

Official plugin: https://streamdeck.streamer.bot/  
Streamer.bot: https://streamer.bot/

SD Bridge is a separate community project and does not replace the official plugin.

## Source layout

```text
SD-Bridge-v0.19.0/
├─ SD-Bridge-v0.19.0.sb
├─ SD-Bridge-Core-v0.19.0.cs
├─ README.md
├─ README_FR.md
├─ CHANGELOG.md
├─ site/
│  ├─ index.html
│  └─ assets/
│     ├─ SD-Bridge-v0.19.0.sb
│     ├─ SD-Bridge-Demo-v0.19.0.mp4
│     ├─ SD-Bridge-Demo-v0.19.0-poster.jpg
│     └─ sd-bridge-logo.png
└─ src/
   ├─ branding/
   │  ├─ SD-Bridge-logo.png
   │  ├─ SD-Bridge-logo.svg
   │  └─ SD-Bridge-logo.ico
   ├─ plugin/
   │  ├─ manifest.template.json
   │  ├─ bin/
   │  │  ├─ plugin.js
   │  │  └─ package.json
   │  └─ imgs/
   │     ├─ plugin/icon.png
   │     └─ actions/bridge/
   │        ├─ icon.png
   │        └─ key.png
   └─ validation-profile/
      └─ Bridge_Validation_Test_SOURCE.streamDeckProfile
```

## Why are the readable sources included?

The files under `src/branding/` are the canonical official SD Bridge logo assets. The logo design must not be altered; the WPF, plugin and website use this same identity.

`SD-Bridge-Core-v0.19.0.cs` is intentionally distributed as a single Streamer.bot C# Core, but it embeds several companion assets as Base64. The readable files are provided so the generated plugin can be inspected, modified, and verified:

- `src/plugin/bin/plugin.js` → `PluginJsBase64`
- `src/plugin/imgs/plugin/icon.png` → `PluginIconBase64`
- `src/plugin/imgs/actions/bridge/icon.png` → `ActionIconBase64`
- `src/plugin/imgs/actions/bridge/key.png` uses the same action branding
- `src/validation-profile/Bridge_Validation_Test_SOURCE.streamDeckProfile` → `ValidationProfileBase64`

The Stream Deck `manifest.json` is generated dynamically by the C# Core because the plugin version and Bridge profile list depend on the current setup. `src/plugin/manifest.template.json` is provided as a readable reference.

The validation `.streamDeckProfile` is itself an archive. Its raw internal GUID folders are intentionally not duplicated in the public package.

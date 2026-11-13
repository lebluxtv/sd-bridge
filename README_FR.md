# SD Bridge

**Version actuelle : v0.20.0**

SD Bridge permet à **Streamer.bot de changer directement le profil et la page affichés sur un Stream Deck**.

## À quoi ça sert ?

Streamer.bot peut interagir avec les boutons du Stream Deck, mais ne permet pas nativement de piloter directement la navigation entre **profils et pages**. SD Bridge ajoute cette possibilité sans remplacer le plugin Stream Deck officiel de Streamer.bot.

## Comment l'utiliser ?

1. Téléchargez [**SD-Bridge-v0.20.0.sb**](./SD-Bridge-v0.20.0.sb) et importez-le dans Streamer.bot.
2. Sélectionnez `01 - Streamer.bot StreamDeck Plugin Addon - Setup Bridge`, faites un clic droit sur **Test**, puis choisissez **Test Trigger**.
3. Dans la fenêtre WPF SD Bridge, sélectionnez le ou les profils Stream Deck à bridger. Pour une première validation sur Stream Deck XL, laissez **Bridge Validation Test** activé.
4. Cliquez sur **Generate plugin** / **Update plugin**. SD Bridge crée le package compagnon `.streamDeckPlugin` et l'ouvre automatiquement.
5. Stream Deck demande d'abord de confirmer l'installation du plugin. Cliquez sur **Install**.
6. Si le package contient des profils préconfigurés — par exemple le profil **Bridge Validation Test** recommandé — Stream Deck affiche une seconde confirmation. Cliquez sur **Install Profile(s)**. Le WPF surveille ensuite l'arrivée des copies de profils importées et vérifie leur structure de pages.
7. Lorsque SD Bridge indique que les profils importés sont prêts, cliquez sur **Start test** et observez le Stream Deck physique.
8. Confirmez avec **Yes, everything worked**, ou utilisez **No / something was wrong** pour générer un rapport de diagnostic sur le Bureau.
9. Après validation, choisissez de conserver ou supprimer les anciens profils non bridgés et le profil temporaire de validation. **Remove now** crée une sauvegarde avant suppression.

Le profil source sélectionné devient :

```text
"Nom de mon Profil"
        ↓
"Nom de mon Profil [Bridge]"
```

Le profil `[Bridge]` devient ensuite votre profil de travail normal dans l'application Stream Deck. Utilisez **Copy name** lorsque vous avez besoin de la valeur exacte de `sdBridge.profile`.

Deux actions d'exemple sont incluses dans l'import Streamer.bot :

- `0x - Streamer.bot StreamDeck Plugin Addon - SwitchPage Exemple (with C#)` — modifiez les valeurs `profile` et `page` dans le code d'exemple.
- `0x - Streamer.bot StreamDeck Plugin Addon - SwitchPage Exemple (with Sub-Actions)` — modifiez les sous-actions Set Argument `sdBridge.profile` et `sdBridge.page` ; l'appel final à `SwitchPage` fait le reste.

`sdBridge.page` accepte le nom exact de la page ou son numéro **à partir de 1**.

## Testé sur

**Windows 11 • Stream Deck XL • Stream Deck App v7.6.1 (23033) (anciennement v7.5.1) • Streamer.bot v1.0.7**

## Support matériel et retours

SD Bridge a actuellement été testé physiquement sur **Stream Deck XL**. Si vous testez un MK.2, Mini, +, Neo, Studio ou plusieurs Stream Deck, ouvrez une [Issue GitHub](https://github.com/lebluxtv/sd-bridge/issues/new/choose) en indiquant le modèle, la version de Stream Deck App, la version de Streamer.bot et ce qui s'est passé.

## En cas de problème

- **Pendant la validation :** cliquez sur **No / something was wrong**, complétez le court questionnaire, puis joignez le rapport `.txt` généré automatiquement sur le Bureau.
- **Ailleurs :** indiquez le modèle de Stream Deck, les versions de Stream Deck App / Streamer.bot et décrivez précisément le problème.

## Package prêt pour le dépôt

Ce package est prêt à servir de contenu au futur dépôt GitHub `sd-bridge`. L'export d'action Streamer.bot officiel est inclus à la racine sous le nom `SD-Bridge-v0.20.0.sb`. Une copie strictement identique est aussi présente dans `site/assets/` afin que le bouton de téléchargement du site fonctionne de manière autonome une fois la documentation publiée.

## Origine et crédits

SD Bridge est parti du **plugin Stream Deck officiel de Streamer.bot** et constitue un dérivé/fork communautaire de ce travail.

Le plugin Stream Deck original de Streamer.bot a été créé par **Whipstickgostop** : https://github.com/Whipstickgostop

Plugin officiel : https://streamdeck.streamer.bot/  
Streamer.bot : https://streamer.bot/

SD Bridge est un projet communautaire séparé et ne remplace pas le plugin officiel.

## Structure des sources

```text
SD-Bridge-v0.20.0/
├─ SD-Bridge-v0.20.0.sb
├─ SD-Bridge-Core-v0.20.0.cs
├─ README.md
├─ README_FR.md
├─ CHANGELOG.md
├─ site/
│  ├─ index.html
│  └─ assets/
│     ├─ SD-Bridge-v0.20.0.sb
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

## Pourquoi fournir les sources lisibles ?

Les fichiers sous `src/branding/` sont les ressources officielles canoniques du logo SD Bridge. Le design du logo ne doit plus être modifié ; le WPF, le plugin et le site utilisent tous cette même identité.

`SD-Bridge-Core-v0.20.0.cs` est volontairement distribué sous la forme d'un Core C# unique pour Streamer.bot, mais il embarque plusieurs éléments du plugin compagnon en Base64. Les fichiers lisibles permettent d'inspecter, modifier et vérifier ce qui est réellement intégré :

- `src/plugin/bin/plugin.js` → `PluginJsBase64`
- `src/plugin/imgs/plugin/icon.png` → `PluginIconBase64`
- `src/plugin/imgs/actions/bridge/icon.png` → `ActionIconBase64`
- `src/plugin/imgs/actions/bridge/key.png` reprend le même branding d'action
- `src/validation-profile/Bridge_Validation_Test_SOURCE.streamDeckProfile` → `ValidationProfileBase64`

Le `manifest.json` Stream Deck est généré dynamiquement par le Core C#, car la version du plugin et la liste des profils Bridge dépendent de la configuration actuelle. `src/plugin/manifest.template.json` sert uniquement de référence lisible.

Le `.streamDeckProfile` de validation est lui-même une archive. Ses dossiers GUID internes extraits ne sont volontairement pas dupliqués dans le package public.


## Récupération des profils — v0.20.0

Si le plugin apparaît dans Stream Deck mais qu'un profil `[Bridge]` manque, cliquez **Install missing** pour demander au SDK d'Elgato d'installer ce profil. Confirmez la fenêtre Stream Deck si elle apparaît, puis vérifiez l'état. L'action peut modifier temporairement le profil actif. Le bouton **Diagnostics** génère un rapport même si la validation n'a pas commencé. **Verify** ne fait que relire les dossiers. Ne supprimez pas les profils d'origine avant validation. La migration du compagnon v0.19.0 → v0.20.0 et la récupération des profils manquants ont été confirmées sur Windows 11, Stream Deck XL et Stream Deck 7.6.1 (23033) le 13 novembre 2026. Les autres modèles et configurations multi-appareils restent à valider.

## Migration de v0.19.0 vers v0.20.0 (sans désinstaller le plugin)

1. Sauvegardez vos profils Stream Deck et votre export d'actions Streamer.bot v0.19.0.
2. Importez `SD-Bridge-v0.20.0.sb` dans Streamer.bot. Évitez de lancer simultanément deux actions Setup Bridge : désactivez l'ancienne action SetupBridge v0.19.0 si elle a été importée sous un autre nom.
3. Lancez **Setup Bridge** de v0.20.0 et sélectionnez le profil d’origine si sa copie `[Bridge]` n’existe pas encore, en conservant les profils déjà bridgés.
4. Cliquez sur **Update plugin**. Le fichier `Bureau\SD Bridge\SD-Bridge.streamDeckPlugin` doit maintenant être en version **1.20.0.x**. Confirmez l'installation/la mise à jour proposée dans Elgato Stream Deck.
5. L'application surveille le manifeste, la configuration et le runtime du compagnon puis demande l'import de tout profil manquant via `switchToProfile`. Acceptez la boîte de dialogue d'import Elgato, si elle apparaît.
6. Si `Verify` indique que le runtime n'est pas chargé, quittez et relancez *uniquement* l'application Stream Deck puis cliquez sur `Verify`. Aucune désinstallation n'est nécessaire.
7. Lancez le test de profil/page et confirmez la réussite. Conservez le profil original tant que le résultat n'est pas validé.

En cas d'échec : **Diagnostics** dans la fenêtre de validation, puis transmettez le rapport. Ne désinstallez pas le plugin par défaut.

**Important :** `SD-Bridge.streamDeckPlugin` est généré localement par le Core lors du Setup ; il n’est pas inclus en tant que plugin préconfiguré dans cette archive.

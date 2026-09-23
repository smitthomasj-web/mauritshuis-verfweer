# Mauritshuis: Verfweer

Statische browser-FPS — start **buiten** het Mauritshuis (Hollands classicisme, Jacob van Campen), ga naar binnen en bescherm de zalen tegen verfgooiende protestanten.

Nederlandse UI. Three.js via CDN import map (geen build-stap). **Call of Duty-stijl** besturing met pointer lock.

## Lokaal starten

```bash
cd /workspace/mauritshuis-shooter
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

### Besturing (klassieke FPS / CoD-stijl)

| Input | Actie |
|-------|--------|
| **Muis** (pointer lock) | Kijken / draaien |
| **WASD** | Lopen |
| **Shift** | Sprint (subtiele FOV-kick) |
| **Spatie** | Springen (kleine hop) |
| **Linkermuisknop** | Shotgun afvuren |
| **Rechtermuisknop** | Richten (ADS): FOV ~52°, strakkere spread, langzamer |
| **R** | Herladen (6 patronen) — ook automatisch bij leeg |
| **F** | Middelvinger-taunt (stun; ring met **Davidsster**) |
| **Esc** | Pauze (verlaat pointer lock expres) |

Muisgevoeligheid: **0.0022** raw, lichte smoothing **0.12** (constanten bovenaan `js/player.js`).

Bij per ongeluk verlies van pointer lock: banner *“Klik om verder te spelen”* — klik op het canvas om opnieuw te vergrendelen (geen pauzemenu).

Haal **5 golven** om te winnen. Leven op 0 = game over.

**Pad:** plein vóór het Mauritshuis → trappen/deuren → entreehal → zalen.

## Gevel

Vrijstaand zandstenen stadspaleis: kolossale Ionische pilasters, 7 traveeën, risalieten, fronton/timpaan, kroonlijst, steil dak met schoorstenen, Hofvijver-water ernaast.

## Bestanden

```
mauritshuis-shooter/
  index.html
  css/style.css
  js/main.js       # bootstrap, pointer lock, golven
  js/player.js     # CoD FPS + shotgun + taunt-hand
  js/enemies.js
  js/world.js      # Mauritshuis-gevel + museumzalen
  js/ui.js
  README.md
```

## Embedden

```html
<iframe
  src="/mauritshuis-shooter/"
  width="960"
  height="540"
  allow="fullscreen; pointer-lock"
  style="border:0;max-width:100%"
></iframe>
```

## Notities

- Moderne browser met ES-modules + WebGL + Pointer Lock API.
- Post-processing: UnrealBloom + ACES + vignette (CoD-achtige look).
- Golf 1 spawnt op het plein vóór het museum — meteen actie na Start.
- Fan/arcade-demo — niet verbonden met de officiële Mauritshuis-website.

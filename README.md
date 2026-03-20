# @openglobes/core

Reusable 3D globe engine for data visualization. Powers [OpenGlobes](https://openglobes.com).

## Globes built with this engine

- 🐟 [FishGlobe](https://fish.openglobes.com) — 35,000+ fish species
- 🦕 [DinoGlobe](https://dino.openglobes.com) — Dinosaur fossil discoveries
- 🌋 [VolcanoGlobe](https://volcano.openglobes.com) — 1,400+ active volcanoes
- 🫨 [QuakeGlobe](https://quake.openglobes.com) — Real-time earthquakes
- ☄️ [MeteorGlobe](https://meteor.openglobes.com) — 45,000+ meteorite landings
- ⚓ [ShipwreckGlobe](https://wreck.openglobes.com) — 250,000+ known wrecks

## Install

```bash
npm install @openglobes/core
```

## Usage

```tsx
import { Globe, FilterPanel, DetailDrawer } from '@openglobes/core'
import { oceanDark } from '@openglobes/core/themes'

<Globe theme={oceanDark} tileBaseUrl="/data/tiles/" />
```

## License

MIT

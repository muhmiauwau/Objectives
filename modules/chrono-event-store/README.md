# chrono-event-store

Zeitbasierter Event-Store für Node.js & Angular (universell, ESModule-kompatibel).

## Installation

```sh
npm install ../chrono-event-store
```

## Nutzung

```typescript
import { ChronoEventStore } from 'chrono-event-store';

const store = new ChronoEventStore();

// Changesets einfügen (z.B. Alter als Zeitachse)
store.insertEvent({ validFrom: 0, changes: { name: 'Max', status: 'init' } });
store.insertEvent({ validFrom: 5.5, changes: { status: 'active' } });
store.insertEvent({ validFrom: 10.25, changes: { name: 'Maximilian' } });

// Zustand zu beliebigem Zeitpunkt rekonstruieren
const state = store.resolveState(6); // { name: 'Max', status: 'active' }

// Timeline abfragen
const timeline = store.getTimeline();

// Feldhistorie
const nameHistory = store.getFieldHistory('name');

// Unterschied zwischen zwei Zeitpunkten
const diff = store.diffBetween(0, 10.25);

// Snapshot exportieren
const snapshot = store.exportSnapshot(10.25);
```

## Build

```sh
npm run build
```

## Exportierte Klasse
- ChronoEventStore

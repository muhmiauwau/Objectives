// chrono-event-store.ts
// Universeller, semantisch zeitbasierter Event-Store für Node.js & Angular

import jsonpatch from 'fast-json-patch';
import set from 'lodash-es/set.js';
import get from 'lodash-es/get.js';

export interface ChronoChangeSet {
  mesId: number;
  changes: Record<string, any>;
  event?: string;
  active?: boolean;
}

export interface FieldHistoryEntry {
  from: any;
  to: any;
  mesId: number;
  event: string;
}

export interface StateSnapshot {
  mesIdQueried: number;
  fields: Record<string, any>;
  validFrom: Record<string, number>;
  events: Record<string, string>;
}

export interface JsonPatchOperation {
  op: string;
  path?: string;
  value?: any;
}

export interface ConstructorChangeSetEntry {
  mesId: number;
  changes: Record<string, any>;
  event?: string;
  active?: boolean;
}

class ChronoEventStore {
  static cacheEnabled: boolean = true;
  private timeline: ChronoChangeSet[] = [];
  private initialState: Record<string, any>;
  private initMesId: number = 0;
  private snapshotCache: Map<number, StateSnapshot> = new Map();
  private lastSnapshotMesId: number | null = null;
  private fieldHistoryCache: Map<string, FieldHistoryEntry[]> = new Map();
  private changeSetMesIds: number[] = [];

  constructor(
    initMesIdOrState: number | Record<string, any> = 0,
    initialStateOrChangeSet?: Record<string, any> | ConstructorChangeSetEntry[],
    changeSetMaybe?: ConstructorChangeSetEntry[]
  ) {
    if (typeof initMesIdOrState === 'number') {
      this.initMesId = initMesIdOrState;
      this.initialState = (initialStateOrChangeSet as Record<string, any>) || {};
      if (Array.isArray(changeSetMaybe)) {
        this.processChangeSetArray(changeSetMaybe);
      }
    } else {
      this.initialState = initMesIdOrState as Record<string, any>;
      if (Array.isArray(initialStateOrChangeSet)) {
        this.processChangeSetArray(initialStateOrChangeSet);
      }
    }
  }

  private processChangeSetArray(changeSet: ConstructorChangeSetEntry[]): void {
    const sorted = changeSet.slice().sort((a, b) => a.mesId - b.mesId);
    for (const entry of sorted) {
      if (entry && typeof entry.mesId === 'number' && entry.changes && typeof entry.changes === 'object') {
        this.addChangeSet({
          mesId: entry.mesId,
          changes: entry.changes,
          event: entry.event,
          active: entry.active
        });
      }
    }
  }

  /**
   * Generiert und cached Snapshots für alle oder nur neue Events
   */
  generateSnapshot(mode: 'ALL' | 'NEW' = 'ALL'): void {
    if (!ChronoEventStore.cacheEnabled) return;
    if (mode === 'ALL') {
      this.snapshotCache.clear();
      this.fieldHistoryCache.clear();
      // Initial-Snapshot
      this.snapshotCache.set(this.initMesId, this.resolveState(this.initMesId));
      // Snapshots für jedes Changeset
      for (const event of this.timeline) {
        this.snapshotCache.set(event.mesId, this.resolveState(event.mesId));
      }
      // Feld-History basierend auf Snapshots generieren
      this.generateFieldHistory();
      this.lastSnapshotMesId = this.timeline.length ? this.timeline[this.timeline.length - 1].mesId : null;
    } else if (mode === 'NEW') {
      // Nur neue Snapshots ab dem letzten bekannten Snapshot generieren
      let lastMesId = this.lastSnapshotMesId;
      const startIdx = lastMesId == null ? 0 : this.timeline.findIndex(e => e.mesId > lastMesId);
      if (startIdx === -1) return;
      for (let i = startIdx; i < this.timeline.length; i++) {
        const event = this.timeline[i];
        this.snapshotCache.set(event.mesId, this.resolveState(event.mesId));
      }
      this.generateFieldHistory();
      this.lastSnapshotMesId = this.timeline.length ? this.timeline[this.timeline.length - 1].mesId : null;
    }
  }

  clearCaches(): void {
    this.snapshotCache.clear();
    this.fieldHistoryCache.clear();
    this.lastSnapshotMesId = null;
  }

  private generateFieldHistory(): void {
    if (!ChronoEventStore.cacheEnabled) return;
    const currentIdxRecord: Record<string, number> = {};
    
    this.snapshotCache.forEach((snapshot: StateSnapshot) => {
      const { fields, events, mesIdQueried } = snapshot;
      
      for (const [fieldKey, fieldValueRaw] of Object.entries(fields)) {
        const fieldValue = fieldValueRaw ?? null;
        const arr = this.fieldHistoryCache.get(fieldKey) ?? [];
        const currentIdx = currentIdxRecord[fieldKey] ?? 0;
        const lastValue = arr.length > 0 ? arr[arr.length - 1] : null;
        
        if (fieldValue !== lastValue?.to) {
          arr.push({
            from: lastValue ? lastValue.to : fieldValue,
            to: fieldValue,
            mesId: mesIdQueried,
            event: arr.length === 0 ? 'init' : events[fieldKey] ?? ''
          });
          
          this.fieldHistoryCache.set(fieldKey, arr);
          currentIdxRecord[fieldKey] = currentIdx + 1;
        }
      }
    });
  }

  /**
   * Fügt ein Changeset hinzu (wie insertEvent, aber für API-Kompatibilität)
   */
  addChangeSet(changeSet: ChronoChangeSet): void {
    if (typeof changeSet.mesId !== 'number' || isNaN(changeSet.mesId)) {
      throw new Error(`Ungültiges Message ID Format für 'mesId': ${changeSet.mesId}.`);
    }
    this.insertChangeSet(changeSet);
    if (!this.changeSetMesIds.includes(changeSet.mesId)) {
      this.changeSetMesIds.push(changeSet.mesId);
      this.changeSetMesIds.sort((a, b) => a - b);
    }
  }

  editChangeSet(changeSet: ChronoChangeSet): void {
    if (typeof changeSet.mesId !== 'number' || isNaN(changeSet.mesId)) {
      throw new Error(`Ungültiges Message ID Format für 'mesId': ${changeSet.mesId}.`);
    }
    const orgIdx = this.timeline.findIndex(e => e.mesId == changeSet.mesId);
    if(orgIdx !== -1){
      this.timeline[orgIdx].changes = {...this.timeline[orgIdx].changes, ...changeSet.changes}
    }

  }


  deleteChangeSet(changeSet: ChronoChangeSet): void {
    if (typeof changeSet.mesId !== 'number' || isNaN(changeSet.mesId)) {
      throw new Error(`Ungültiges Message ID Format für 'mesId': ${changeSet.mesId}.`);
    }
    const orgIdx = this.timeline.findIndex(e => e.mesId == changeSet.mesId);
    if(orgIdx !== -1){
      delete this.timeline[orgIdx]
    }
  }

  


  /**
   * Fügt ein Changeset chronologisch ein (auch zwischen bestehende Events)
   */
  private insertChangeSet(changeSet: ChronoChangeSet): void {

    const idx = this.timeline.findIndex(e => e.mesId > changeSet.mesId);
    if (idx === -1) {
      this.timeline.push(changeSet);
    } else {
      this.timeline.splice(idx, 0, changeSet);
    }
  }

  /**
   * Gibt die Timeline (kopiert, chronologisch sortiert) zurück
   */
  getTimeline(): ChronoChangeSet[] {
    return [...this.timeline];
  }

  private toJsonPointer(path: string): string {
    return '/' + path.replace(/\[(\d+)\]/g, '/$1').replace(/\./g, '/');
  }

  private flattenObjectWithArrayNotation(obj: any, prefix = '', out: Record<string, any> = {}): Record<string, any> {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (obj[i] !== undefined) {
          this.flattenObjectWithArrayNotation(obj[i], `${prefix}[${i}]`, out);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        this.flattenObjectWithArrayNotation(value, newKey, out);
      }
    } else if (prefix && obj !== undefined) {
      out[prefix] = obj;
    }
    return out;
  }

  /**
   * Rekonstruiert den Zustand zum gewünschten Zeitpunkt
   * Gibt ein Objekt mit mesIdQueried und fields (inkl. value und validFrom für jedes Feld) zurück
   * Unterstützt JSON Patch Operationen für Array-Änderungen ("add", "remove")
   */
  resolveState(at: number): StateSnapshot {
    let stateObj = JSON.parse(JSON.stringify(this.initialState));
    const mesIdMap: Record<string, number> = {};
    const eventMap: Record<string, string> = {};
    for (const event of this.timeline) {
      if (event.mesId > at) break;
      if (event.active === false) continue;
      const stateBefore = JSON.parse(JSON.stringify(stateObj));
      for (const key in event.changes) {
        const changeVal = event.changes[key];
        if (this.isJsonPatchOperation(changeVal)) {
          this.applyPatchOperation(stateObj, key, changeVal);
        } else {
          this.applyDirectChange(stateObj, key, changeVal);
        }
      }
      // Nach jedem Changeset: Vergleiche stateBefore und stateObj, setze mesId/events für alle geänderten Keys
      const diffOps = jsonpatch.compare(stateBefore, stateObj);
      diffOps.forEach(op => {
        if (op.path) {
          // JSON Pointer zu Dot-Notation mit Array-Indizes
          const dotKey = op.path.slice(1).replace(/\/(\d+)/g, '[$1]').replace(/\//g, '.');
          mesIdMap[dotKey] = event.mesId;
          eventMap[dotKey] = event.event || '';
        }
      });
    }
    // changedmesId/events nur für Keys, die im verschachtelten stateObj existieren
    const changedmesId: Record<string, any> = {};
    const changedEvents: Record<string, any> = {};
    Object.keys(mesIdMap).forEach(key => {
      set(changedmesId, key, mesIdMap[key]);
    });
    Object.keys(eventMap).forEach(key => {
      if (eventMap[key] !== '') set(changedEvents, key, eventMap[key]);
    });
    return {
      mesIdQueried: at,
      fields: stateObj,
      validFrom: changedmesId,
      events: changedEvents
    };
  }


  private isJsonPatchOperation(changeVal: any): boolean {
    return (Array.isArray(changeVal) || (typeof changeVal === 'object' && changeVal && 'op' in changeVal)) && 
           ((Array.isArray(changeVal) && changeVal.length > 0 && typeof changeVal[0] === 'object' && 'op' in changeVal[0]) || 
            (typeof changeVal === 'object' && changeVal && 'op' in changeVal));
  }

  private applyPatchOperation(stateObj: any, key: string, changeVal: any): void {
    const patchArr = Array.isArray(changeVal) ? changeVal : [changeVal];
    const targetArr = get(stateObj, key.replace(/\[(\d+)\]/g, '.$1'));
    const patchOps = patchArr.map((opObj: any) => {
      if (opObj.op === 'add' && Array.isArray(targetArr)) {
        return { ...opObj, path: this.toJsonPointer(key) + '/-' };
      }
      return { ...opObj, path: this.toJsonPointer(key) };
    });
    stateObj = jsonpatch.applyPatch(stateObj, patchOps, true).newDocument;
  }

  private applyDirectChange(stateObj: any, key: string, changeVal: any): void {
    const currentVal = get(stateObj, key.replace(/\[(\d+)\]/g, '.$1'));
    
    if (typeof currentVal === 'number' && typeof changeVal === 'string' && /^([+-])\d+(\.\d+)?$/.test(changeVal)) {
      const delta = parseFloat(changeVal);
      set(stateObj, key.replace(/\[(\d+)\]/g, '.$1'), currentVal + delta);
    } else {
      set(stateObj, key.replace(/\[(\d+)\]/g, '.$1'), changeVal);
    }
  }

  /**
   * Gibt die Historie eines Feldes als Array von {from, to, mesId, event}
   */
  getFieldHistory(key: string, start?: number, end?: number): FieldHistoryEntry[] {
    const arr = this.fieldHistoryCache.get(key) || [];
    if (typeof start === 'number' || typeof end === 'number') {
      const filtered = arr.filter(h => (start === undefined || h.mesId >= start) && (end === undefined || h.mesId <= end));
      if (typeof start === 'number') {
        // Finde den letzten Eintrag mit mesId < start
        const lastBefore = [...arr].reverse().find(h => h.mesId < start);
        if (lastBefore) {
          return [lastBefore, ...filtered];
        }
      }
      return filtered;
    }
    return arr;
  }

  /**
   * Exportiert einen Snapshot des Zustands zu einem Zeitpunkt
   */
  exportSnapshot(at: number): StateSnapshot {
    return this.resolveState(at);
  }

  getCachedSnapshot(at: number): StateSnapshot | undefined {
    if (!ChronoEventStore.cacheEnabled) return undefined;
    return this.snapshotCache.get(at);
  }

  getBestSnapshotForMesId(mesId: number): StateSnapshot | undefined {
    const availableMesIds = this.changeSetMesIds.slice().sort((a, b) => a - b);
    let bestMesId = availableMesIds.filter(a => a <= mesId).pop();
    if (bestMesId === undefined) bestMesId = availableMesIds[0];
    if (bestMesId !== undefined) {
      if (!ChronoEventStore.cacheEnabled) {
        const snapshot = this.resolveState(bestMesId);
        return { ...snapshot, mesIdQueried: mesId };
      }
      let snapshot = this.getCachedSnapshot(bestMesId);
      if (!snapshot) {
        snapshot = this.resolveState(bestMesId);
        this.snapshotCache.set(bestMesId, snapshot);
      }
      return { ...snapshot, mesIdQueried: mesId };
    }
    return undefined;
  }
}



const stores = new Map<string, ChronoEventStore>();

const chrono = {
  add(id: string): ChronoEventStore {
    if (!stores.has(id)) {
      stores.set(id, new ChronoEventStore());
    }
    return stores.get(id)!;
  },

  init(id: string, mesId: number = 0, state: Record<string, any> = {}): ChronoEventStore {
  console.log("init");
  const store = new ChronoEventStore(mesId, state);
  // Initialdaten als Changeset hinzufügen, wenn keine Timeline vorhanden ist
  if (Object.keys(state).length > 0) {
    store.addChangeSet({
      mesId: mesId,
      changes: JSON.parse(JSON.stringify(state)),
      event: 'init',
      active: true
    });
  }
  stores.set(id, store);
  return store;
},

  addChangeSets(id: string, entries: any[]): ChronoEventStore | undefined {
    const store = stores.get(id);
    if (!store) return undefined;
    for (const entry of entries) {
      
      store.addChangeSet(entry);
    }
    // store.generateSnapshot('NEW');
    return store;
  },

  addChangeSet(id: string, changeset: any): ChronoEventStore | undefined {
    const store = stores.get(id);
    if (!store) return undefined;
 
    store.addChangeSet(changeset);
    // store.generateSnapshot('NEW');
    return store;
  },

  generateSnapshots(id: string): ChronoEventStore | undefined {
    const store = stores.get(id);
    if (store) {
      store.generateSnapshot('ALL');
    }
    return store;
  },

  getPoint(id: string, mesId: number): any {
    const store = stores.get(id);
    if (!store) return undefined;

    return store.getBestSnapshotForMesId(mesId);
  },

  remove(id: string): boolean {
    return stores.delete(id);
  },

  get(id: string): ChronoEventStore | undefined {
    return stores.get(id);
  },

  list(): string[] {
    return Array.from(stores.keys());
  },

  has(id: string): boolean {
    if (!ChronoEventStore.cacheEnabled) return false;
    return stores.has(id);
  },

  noCache(): void {
    ChronoEventStore.cacheEnabled = false;
    for (const store of stores.values()) {
      store.clearCaches();
    }
  }
};


export {chrono, ChronoEventStore }
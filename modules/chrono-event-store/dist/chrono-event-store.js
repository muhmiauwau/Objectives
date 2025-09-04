// chrono-event-store.ts
// Universeller, semantisch zeitbasierter Event-Store für Node.js & Angular
import jsonpatch from 'fast-json-patch';
import set from 'lodash-es/set.js';
import get from 'lodash-es/get.js';
class ChronoEventStore {
    constructor(initMesIdOrState = 0, initialStateOrChangeSet, changeSetMaybe) {
        this.timeline = [];
        this.initMesId = 0;
        this.snapshotCache = new Map();
        this.lastSnapshotMesId = null;
        this.fieldHistoryCache = new Map();
        this.changeSetMesIds = [];
        if (typeof initMesIdOrState === 'number') {
            this.initMesId = initMesIdOrState;
            this.initialState = initialStateOrChangeSet || {};
            if (Array.isArray(changeSetMaybe)) {
                this.processChangeSetArray(changeSetMaybe);
            }
        }
        else {
            this.initialState = initMesIdOrState;
            if (Array.isArray(initialStateOrChangeSet)) {
                this.processChangeSetArray(initialStateOrChangeSet);
            }
        }
    }
    processChangeSetArray(changeSet) {
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
    generateSnapshot(mode = 'ALL') {
        if (!ChronoEventStore.cacheEnabled)
            return;
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
        }
        else if (mode === 'NEW') {
            // Nur neue Snapshots ab dem letzten bekannten Snapshot generieren
            let lastMesId = this.lastSnapshotMesId;
            const startIdx = lastMesId == null ? 0 : this.timeline.findIndex(e => e.mesId > lastMesId);
            if (startIdx === -1)
                return;
            for (let i = startIdx; i < this.timeline.length; i++) {
                const event = this.timeline[i];
                this.snapshotCache.set(event.mesId, this.resolveState(event.mesId));
            }
            this.generateFieldHistory();
            this.lastSnapshotMesId = this.timeline.length ? this.timeline[this.timeline.length - 1].mesId : null;
        }
    }
    clearCaches() {
        this.snapshotCache.clear();
        this.fieldHistoryCache.clear();
        this.lastSnapshotMesId = null;
    }
    generateFieldHistory() {
        if (!ChronoEventStore.cacheEnabled)
            return;
        const currentIdxRecord = {};
        this.snapshotCache.forEach((snapshot) => {
            var _a, _b, _c;
            const { fields, events, mesIdQueried } = snapshot;
            for (const [fieldKey, fieldValueRaw] of Object.entries(fields)) {
                const fieldValue = fieldValueRaw !== null && fieldValueRaw !== void 0 ? fieldValueRaw : null;
                const arr = (_a = this.fieldHistoryCache.get(fieldKey)) !== null && _a !== void 0 ? _a : [];
                const currentIdx = (_b = currentIdxRecord[fieldKey]) !== null && _b !== void 0 ? _b : 0;
                const lastValue = arr.length > 0 ? arr[arr.length - 1] : null;
                if (fieldValue !== (lastValue === null || lastValue === void 0 ? void 0 : lastValue.to)) {
                    arr.push({
                        from: lastValue ? lastValue.to : fieldValue,
                        to: fieldValue,
                        mesId: mesIdQueried,
                        event: arr.length === 0 ? 'init' : (_c = events[fieldKey]) !== null && _c !== void 0 ? _c : ''
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
    addChangeSet(changeSet) {
        if (typeof changeSet.mesId !== 'number' || isNaN(changeSet.mesId)) {
            throw new Error(`Ungültiges Message ID Format für 'mesId': ${changeSet.mesId}.`);
        }
        this.insertChangeSet(changeSet);
        if (!this.changeSetMesIds.includes(changeSet.mesId)) {
            this.changeSetMesIds.push(changeSet.mesId);
            this.changeSetMesIds.sort((a, b) => a - b);
        }
    }
    editChangeSet(changeSet) {
        // if (typeof changeSet.mesId !== 'number' || isNaN(changeSet.mesId)) {
        //   throw new Error(`Ungültiges Message ID Format für 'mesId': ${changeSet.mesId}.`);
        // }
        console.log("editChangeSets", changeSet.mesId);
        const orgIdx = this.timeline.findIndex(e => e.mesId == changeSet.mesId);
        if (orgIdx !== -1) {
            console.log("editChangeSets in ");
            console.dir(this.timeline[orgIdx]);
            this.timeline[orgIdx].changes = Object.assign(Object.assign({}, this.timeline[orgIdx].changes), changeSet.changes);
            console.dir(this.timeline[orgIdx]);
        }
    }
    /**
     * Fügt ein Changeset chronologisch ein (auch zwischen bestehende Events)
     */
    insertChangeSet(changeSet) {
        const idx = this.timeline.findIndex(e => e.mesId > changeSet.mesId);
        if (idx === -1) {
            this.timeline.push(changeSet);
        }
        else {
            this.timeline.splice(idx, 0, changeSet);
        }
    }
    /**
     * Gibt die Timeline (kopiert, chronologisch sortiert) zurück
     */
    getTimeline() {
        return [...this.timeline];
    }
    toJsonPointer(path) {
        return '/' + path.replace(/\[(\d+)\]/g, '/$1').replace(/\./g, '/');
    }
    flattenObjectWithArrayNotation(obj, prefix = '', out = {}) {
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if (obj[i] !== undefined) {
                    this.flattenObjectWithArrayNotation(obj[i], `${prefix}[${i}]`, out);
                }
            }
        }
        else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key))
                    continue;
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                this.flattenObjectWithArrayNotation(value, newKey, out);
            }
        }
        else if (prefix && obj !== undefined) {
            out[prefix] = obj;
        }
        return out;
    }
    /**
     * Rekonstruiert den Zustand zum gewünschten Zeitpunkt
     * Gibt ein Objekt mit mesIdQueried und fields (inkl. value und validFrom für jedes Feld) zurück
     * Unterstützt JSON Patch Operationen für Array-Änderungen ("add", "remove")
     */
    resolveState(at) {
        let stateObj = JSON.parse(JSON.stringify(this.initialState));
        const mesIdMap = {};
        const eventMap = {};
        for (const event of this.timeline) {
            if (event.mesId > at)
                break;
            if (event.active === false)
                continue;
            const stateBefore = JSON.parse(JSON.stringify(stateObj));
            for (const key in event.changes) {
                const changeVal = event.changes[key];
                if (this.isJsonPatchOperation(changeVal)) {
                    this.applyPatchOperation(stateObj, key, changeVal);
                }
                else {
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
        const changedmesId = {};
        const changedEvents = {};
        Object.keys(mesIdMap).forEach(key => {
            set(changedmesId, key, mesIdMap[key]);
        });
        Object.keys(eventMap).forEach(key => {
            if (eventMap[key] !== '')
                set(changedEvents, key, eventMap[key]);
        });
        return {
            mesIdQueried: at,
            fields: stateObj,
            validFrom: changedmesId,
            events: changedEvents
        };
    }
    isJsonPatchOperation(changeVal) {
        return (Array.isArray(changeVal) || (typeof changeVal === 'object' && changeVal && 'op' in changeVal)) &&
            ((Array.isArray(changeVal) && changeVal.length > 0 && typeof changeVal[0] === 'object' && 'op' in changeVal[0]) ||
                (typeof changeVal === 'object' && changeVal && 'op' in changeVal));
    }
    applyPatchOperation(stateObj, key, changeVal) {
        const patchArr = Array.isArray(changeVal) ? changeVal : [changeVal];
        const targetArr = get(stateObj, key.replace(/\[(\d+)\]/g, '.$1'));
        const patchOps = patchArr.map((opObj) => {
            if (opObj.op === 'add' && Array.isArray(targetArr)) {
                return Object.assign(Object.assign({}, opObj), { path: this.toJsonPointer(key) + '/-' });
            }
            return Object.assign(Object.assign({}, opObj), { path: this.toJsonPointer(key) });
        });
        stateObj = jsonpatch.applyPatch(stateObj, patchOps, true).newDocument;
    }
    applyDirectChange(stateObj, key, changeVal) {
        const currentVal = get(stateObj, key.replace(/\[(\d+)\]/g, '.$1'));
        if (typeof currentVal === 'number' && typeof changeVal === 'string' && /^([+-])\d+(\.\d+)?$/.test(changeVal)) {
            const delta = parseFloat(changeVal);
            set(stateObj, key.replace(/\[(\d+)\]/g, '.$1'), currentVal + delta);
        }
        else {
            set(stateObj, key.replace(/\[(\d+)\]/g, '.$1'), changeVal);
        }
    }
    /**
     * Gibt die Historie eines Feldes als Array von {from, to, mesId, event}
     */
    getFieldHistory(key, start, end) {
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
    exportSnapshot(at) {
        return this.resolveState(at);
    }
    getCachedSnapshot(at) {
        if (!ChronoEventStore.cacheEnabled)
            return undefined;
        return this.snapshotCache.get(at);
    }
    getBestSnapshotForMesId(mesId) {
        const availableMesIds = this.changeSetMesIds.slice().sort((a, b) => a - b);
        let bestMesId = availableMesIds.filter(a => a <= mesId).pop();
        if (bestMesId === undefined)
            bestMesId = availableMesIds[0];
        if (bestMesId !== undefined) {
            if (!ChronoEventStore.cacheEnabled) {
                const snapshot = this.resolveState(bestMesId);
                return Object.assign(Object.assign({}, snapshot), { mesIdQueried: mesId });
            }
            let snapshot = this.getCachedSnapshot(bestMesId);
            if (!snapshot) {
                snapshot = this.resolveState(bestMesId);
                this.snapshotCache.set(bestMesId, snapshot);
            }
            return Object.assign(Object.assign({}, snapshot), { mesIdQueried: mesId });
        }
        return undefined;
    }
}
ChronoEventStore.cacheEnabled = true;
const stores = new Map();
const chrono = {
    add(id) {
        if (!stores.has(id)) {
            stores.set(id, new ChronoEventStore());
        }
        return stores.get(id);
    },
    init(id, mesId = 0, state = {}) {
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
    addChangeSets(id, entries) {
        const store = stores.get(id);
        if (!store)
            return undefined;
        for (const entry of entries) {
            store.addChangeSet(entry);
        }
        // store.generateSnapshot('NEW');
        return store;
    },
    addChangeSet(id, changeset) {
        const store = stores.get(id);
        if (!store)
            return undefined;
        store.addChangeSet(changeset);
        // store.generateSnapshot('NEW');
        return store;
    },
    generateSnapshots(id) {
        const store = stores.get(id);
        if (store) {
            store.generateSnapshot('ALL');
        }
        return store;
    },
    getPoint(id, mesId) {
        const store = stores.get(id);
        if (!store)
            return undefined;
        return store.getBestSnapshotForMesId(mesId);
    },
    remove(id) {
        return stores.delete(id);
    },
    get(id) {
        return stores.get(id);
    },
    list() {
        return Array.from(stores.keys());
    },
    has(id) {
        if (!ChronoEventStore.cacheEnabled)
            return false;
        return stores.has(id);
    },
    noCache() {
        ChronoEventStore.cacheEnabled = false;
        for (const store of stores.values()) {
            store.clearCaches();
        }
    }
};
export { chrono, ChronoEventStore };

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
declare class ChronoEventStore {
    static cacheEnabled: boolean;
    private timeline;
    private initialState;
    private initMesId;
    private snapshotCache;
    private lastSnapshotMesId;
    private fieldHistoryCache;
    private changeSetMesIds;
    constructor(initMesIdOrState?: number | Record<string, any>, initialStateOrChangeSet?: Record<string, any> | ConstructorChangeSetEntry[], changeSetMaybe?: ConstructorChangeSetEntry[]);
    private processChangeSetArray;
    /**
     * Generiert und cached Snapshots für alle oder nur neue Events
     */
    generateSnapshot(mode?: 'ALL' | 'NEW'): void;
    clearCaches(): void;
    private generateFieldHistory;
    /**
     * Fügt ein Changeset hinzu (wie insertEvent, aber für API-Kompatibilität)
     */
    addChangeSet(changeSet: ChronoChangeSet): void;
    editChangeSet(changeSet: ChronoChangeSet): void;
    /**
     * Fügt ein Changeset chronologisch ein (auch zwischen bestehende Events)
     */
    private insertChangeSet;
    /**
     * Gibt die Timeline (kopiert, chronologisch sortiert) zurück
     */
    getTimeline(): ChronoChangeSet[];
    private toJsonPointer;
    private flattenObjectWithArrayNotation;
    /**
     * Rekonstruiert den Zustand zum gewünschten Zeitpunkt
     * Gibt ein Objekt mit mesIdQueried und fields (inkl. value und validFrom für jedes Feld) zurück
     * Unterstützt JSON Patch Operationen für Array-Änderungen ("add", "remove")
     */
    resolveState(at: number): StateSnapshot;
    private isJsonPatchOperation;
    private applyPatchOperation;
    private applyDirectChange;
    /**
     * Gibt die Historie eines Feldes als Array von {from, to, mesId, event}
     */
    getFieldHistory(key: string, start?: number, end?: number): FieldHistoryEntry[];
    /**
     * Exportiert einen Snapshot des Zustands zu einem Zeitpunkt
     */
    exportSnapshot(at: number): StateSnapshot;
    getCachedSnapshot(at: number): StateSnapshot | undefined;
    getBestSnapshotForMesId(mesId: number): StateSnapshot | undefined;
}
declare const chrono: {
    add(id: string): ChronoEventStore;
    init(id: string, mesId?: number, state?: Record<string, any>): ChronoEventStore;
    addChangeSets(id: string, entries: any[]): ChronoEventStore | undefined;
    addChangeSet(id: string, changeset: any): ChronoEventStore | undefined;
    generateSnapshots(id: string): ChronoEventStore | undefined;
    getPoint(id: string, mesId: number): any;
    remove(id: string): boolean;
    get(id: string): ChronoEventStore | undefined;
    list(): string[];
    has(id: string): boolean;
    noCache(): void;
};
export { chrono, ChronoEventStore };

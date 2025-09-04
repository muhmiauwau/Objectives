import {chrono, ChronoEventStore } from './chrono-event-store.js';


const initMesId = 0;

const initData = {
    "facialStructure": {
        "faceShape": "Oval",
        "faceAsymmetry": "Leicht",
    }
}



const changeSet = [
    {
        "id": 1,
        "mesId": 5,
        "event": "eventfriseurbesuch_017",
        "active": true,
        "changes": {
            "expression.eyebrowIntensity": "Stark",
            "appearance.hairStyle": "Kurz",
            "appearance.hairColor": "Blond"
        }
    }

]

// const changeSet:any = []
const chronoEventStore = new ChronoEventStore(initMesId, initData, changeSet);


// chronoEventStore.generateSnapshot("ALL")

// Event: Gesichtsform ändert sich
// chronoEventStore.addChangeSet({ mesId: 5, changes: { 'facialStructure.faceShape': '1' } });

chronoEventStore.editChangeSet({ mesId: 5, changes: { 'facialStructure.faceShape': '3', 'appearance.hairColor': 'Brown' } });

// // Event: Stirnform wird rund
chronoEventStore.addChangeSet({ mesId: 6, changes: { 'appearance.hairColor': 'Rund' } });
// // Event: Kieferform wird U-förmig
// store.addChangeSet({ validFrom: 15.000, changes: { 'test.facialStructure.jawShape': 'U-förmig' } });
// // Event: Kinnprojektion wird ausgeprägt
// store.addChangeSet({ validFrom: 40.000, changes: { 'test.facialStructure.chinProjection': 'Ausgeprägt' } });

console.log('Zustand bei 0:', chronoEventStore.resolveState(5));


// console.log('Zustand bei 20:');
// console.dir(chrono.getPoint(5 ,21), { depth: null, colors: true });

// console.log('Zustand bei 23:');
// console.dir(chronoEventStore.resolveState(23.000), { depth: null, colors: true });


// console.log('Timeline:', chronoEventStore.getTimeline());

// console.log('Historie Gesichtsform:', chronoEventStore.getFieldHistory('test.facialStructure.faceShape'));
// console.log('Diff 0→40:', chronoEventStore.diffBetween(0, 40));

// console.dir(chronoEventStore.getFieldHistory('test.facialStructure.faceShape'), { depth: null, colors: true });

// console.log('getFieldHistory energielevel:');
// console.dir(chronoEventStore.getFieldHistory('energielevel', 0, 22), { depth: null, colors: true });
// console.dir(chronoEventStore.getCachedSnapshot(1), { depth: null, colors: true });



// console.log('Snapshot 40:', chronoEventStore.exportSnapshot(23.3));



// const id = "yeoorkq3f1snfz46ykir1php"
// chrono.noCache()
// chrono.add(id);
// chrono.init(id, initMesId, initData);
// // chrono.addChangeSets(id, changeSet);
// console.log("out:",  chrono.getPoint(id, 18));
// // chrono.generateSnapshots(id);
// // chrono.remove(id);

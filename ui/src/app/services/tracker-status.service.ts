import { Injectable, signal} from '@angular/core';
import * as _ from 'lodash-es';

import ST from 'data/SillyTavern';

const workflows = {
    normal: [
      'init',
      'done'
    ],
    first: [
      'init',
      'fullGen',
      'done'
    ],
    new: [
      'init',
      'analyse',
      'genFields',
      'done'
    ]
};

@Injectable({
  providedIn: 'root',
})
export class TrackerStatusService {
  status: any = []
  statusUpdate = signal({})
  statusAll = signal(false)



  constructor(){
    const { eventSource, event_types } = ST();
    
    eventSource.on(event_types.CHAT_CHANGED, async (data: any) => {
      this.status = []
      _.forEach(ST().chat, (entry, id) => {
        if(entry.tracker && _.size(entry.tracker) > 0){
          this.status.push({
            id: id,
            status: "done"
          })
        }
      })

      //  console.log("TrackerStatusService",this.status)
       this.statusAll.set(!this.statusAll())
    });
  }


  set(id: any, newStatus: string, data?: any) {
     console.log(`TrackerStatusService Status setzen ${id} auf '${newStatus}'`, this.status);
    // Finde den existierenden Status-Eintrag oder erstelle einen neuen
    const existingIndex = this.status.findIndex((item: any) => item.id === id);
    
    if (existingIndex !== -1) {
      // Aktualisiere den existierenden Status
      this.status[existingIndex].status = newStatus;
      
      // Füge Daten hinzu (z.B. Analyse-Ergebnisse)
      if (data !== undefined) {
        this.status[existingIndex].data = data;
      }
      
      //  console.log("TrackerStatusService -", id, newStatus, this.status[existingIndex]);
      // this.statusUpdate.set(this.status[existingIndex]);
      return this.status[existingIndex]
    } else {
      // Erstelle einen neuen Status-Eintrag
      const newEntry: any = {
        id: id,
        status: newStatus,
      };
      
      // Füge Daten hinzu falls vorhanden
      if (data !== undefined) {
        newEntry.data = data;
      }
      
      this.status.push(newEntry);
      
      // this.statusUpdate.set(newEntry);
      return newEntry
    }
    return false
  }

  get(id: any): string | null {
    const statusEntry = this.status.find((item: any) => item.id === id);
    return statusEntry ? statusEntry : null;
  }

  // Hilfsmethode um zu prüfen ob eine Komponente fertig geladen ist
  isDone(id: any): boolean {
    return this.get(id) === 'done';
  }

  // Hilfsmethode um zu prüfen ob eine Komponente einen bestimmten Status hat
  has(id: any, status: string): boolean {
    return this.get(id) === status;
  }

  // Hilfsmethode um alle Status abzurufen
  getAll(): any[] {
    return [...this.status];
  }

  // Hilfsmethode um Status zu entfernen (cleanup)
  remove(id: any): void {
    const index = this.status.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.status.splice(index, 1);
      this.statusUpdate.set(!this.statusUpdate());
    }
  }

  // Hilfsmethode um Status zu entfernen (cleanup)
  setAndUpdate(id: any, newStatus: string, data?: any): void {
    const status = this.set(id, newStatus, data)
    this.statusUpdate.set({
        id: id,
        status: newStatus,
    });
  }


  getWorkflow(type: string){
    return _.get(workflows, type,[])  
  }

  isStepCompleted(workflow: any, step: string, currentStatus: string): boolean {
    const stepIndex = _.indexOf(workflow, step)
    const currentIndex = _.indexOf(workflow, currentStatus)
    return stepIndex < currentIndex && stepIndex !== -1;
  }

  

}

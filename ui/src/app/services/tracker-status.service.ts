import { Injectable, signal} from '@angular/core';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class TrackerStatusService {
  status: any = []
  statusUpdate = signal({})

  set(id: any, newStatus: string, data?: any) {
     console.log(`Status setzen ${id} auf '${newStatus}'`, this.status);
    // Finde den existierenden Status-Eintrag oder erstelle einen neuen
    const existingIndex = this.status.findIndex((item: any) => item.id === id);
    
    if (existingIndex !== -1) {
      // Aktualisiere den existierenden Status
      this.status[existingIndex].status = newStatus;
      this.status[existingIndex].lastUpdated = new Date().toISOString();
      
      // Füge Daten hinzu (z.B. Analyse-Ergebnisse)
      if (data !== undefined) {
        this.status[existingIndex].data = data;
      }
      
      // Triggere das statusUpdate Signal mit dem aktualisierten Eintrag
      this.statusUpdate.set(this.status[existingIndex]);
    } else {
      // Erstelle einen neuen Status-Eintrag
      const newEntry: any = {
        id: id,
        status: newStatus,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Füge Daten hinzu falls vorhanden
      if (data !== undefined) {
        newEntry.data = data;
      }
      
      this.status.push(newEntry);
      
      this.statusUpdate.set(newEntry);
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

}

import { Component, inject, effect, model, signal } from '@angular/core';
import { TrackerService } from 'tracker/services/tracker.service';
import * as _ from 'lodash-es';
import { StoreService } from 'services/store.service';

import { TrackerEditField } from 'tracker/components/edit-field/edit-field';

@Component({
  selector: 'tracker-element',
  imports: [TrackerEditField],
  templateUrl: './element.html',
  styleUrl: './element.less',
})
export class TrackerElement {
  private store = inject(StoreService);
  private Tracker = inject(TrackerService);
  headline: string = 'Tracker panel';

  tracker: any = model([]);

  activeTab = signal(1)
  drawers = signal({})

  constructor() {
    this.Tracker.init();

    this.activeTab.set(this.store.getUI("Tracker-activeTab"))
    this.drawers.set(this.store.getUI("Tracker-activeDrawer"))

    effect(() => {
      const panelTracker = this.Tracker.panelTracker();
      if (panelTracker && _.size(panelTracker)) {
        this.tracker.set(panelTracker);
        this.setHeadline(panelTracker.mesIdQueried);

        console.log('panelTracker', panelTracker);
      }


      const tracker = this.tracker();
      if (tracker && _.size(tracker)) {
        console.log('tracker',tracker)
      }
    });
  }

  setHeadline(id: number) {
    if (id < 0) {
      this.headline = 'Current Tracker';
    } else {
      this.headline = `Tracker for ID: ${id}`;
    }
  }

  asArray(obj: any) {
    const out: any[] = [];
    for (let [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      // console.log(key ,Array.isArray(value), value)
      if (type == 'object' && !Array.isArray(value)) {
        value = this.asArray(value);
      } else if (Array.isArray(value)) {
        type = 'array';
      }

      out.push({
        key,
        value,
        type,
      });
    }
    return out;
  }



  updateField(key: string[], value: any) { 
    this.tracker.update((obj: any) => {
        _.set(obj.fields, key, value);
        return obj;
    });
  }


  saveFields(){
    console.log("saveFields")

    this.Tracker.save(this.tracker())
  }


  getValidFrom(path: string[]){
    return _.get(this.tracker().validFrom, path, 0);
  }



  setActiveTab(id:number){
    this.activeTab.set(id)
    this.store.setUI("Tracker-activeTab", id)
  }


  toggleDrawers(name:any){

    const drawers:any = this.drawers()

    drawers[name] = !this.checkDrawer(name)

    this.activeTab.set(drawers)
    this.store.setUI("Tracker-activeDrawer", drawers)
  }

  checkDrawer(name:any){
    return _.get(this.drawers(), name, false)

  }

}

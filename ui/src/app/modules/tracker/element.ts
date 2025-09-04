import { Component, inject, effect, model } from '@angular/core';


import { TrackerService } from 'tracker/services/tracker.service'
import * as _ from 'lodash-es';

import { TrackerEditField } from 'tracker/components/edit-field/edit-field'

@Component({
  selector: 'tracker-element',
  imports: [
    TrackerEditField

  ],
  templateUrl: './element.html',
  styleUrl: './element.less'
})
export class TrackerElement {
  private Tracker = inject(TrackerService);
  headline: string = 'Tracker panel';

  tracker: any = model([])

  constructor(){
    this.Tracker.init()



    effect(()=>{
      const panelTracker = this.Tracker.panelTracker();
      if (panelTracker && _.size(panelTracker)){

        this.tracker.set(panelTracker)
        this.setHeadline(panelTracker.mesIdQueried);

        console.log( "panelTracker", panelTracker)
        
        // if (panelTracker.id  !== this.id ){
          // this._tracker = panelTracker.tracker

          // this.id = panelTracker.id
          // this.tracker.set({...panelTracker.tracker});

          // this.changes.set(panelTracker.changes)
          // this.setHeadline(panelTracker.id);
        // }
      }
    })

  }


  setHeadline(id: number) {
    if(id < 0){
      this.headline = 'Current Tracker';
    }else{
      this.headline = `Tracker for ID: ${id}`;
    }
  }



  asArray(obj:any){
    const out:any[] = []
    for (const [key, value] of Object.entries(obj)) {
      out.push({
        key,
        value,
        type: (typeof value)
      })
    }
    return out
  }


}

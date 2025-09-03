import { Component, effect, signal, model, inject, computed } from '@angular/core';
import { TrackerService } from 'services/tracker.service';
import * as _ from 'lodash-es';
import ST from 'data/SillyTavern';
import { Tracker } from 'narrator-msg/tracker/tracker';

@Component({
  selector: 'app-current-tracker',
  imports: [Tracker],
  templateUrl: './current-tracker.html',
  styleUrl: './current-tracker.less',
})
export class CurrentTracker {
  trackerService = inject(TrackerService);
  headline: string = '';
  narratioStr: string = '';

  id:number = -2

  _tracker:any;
  tracker:any = model({});
  changes:any = signal({});




  constructor() {
    effect(async () => {
      const panelTracker = this.trackerService.panelTracker();
      if (panelTracker && panelTracker.tracker !== this._tracker) {
        console.log( "panelTracker", panelTracker)
        // if (panelTracker.id  !== this.id ){
          this._tracker = panelTracker.tracker

          this.id = panelTracker.id
          this.tracker.set({...panelTracker.tracker});

          this.changes.set(panelTracker.changes)
          this.setHeadline(panelTracker.id);
        // }
      }

      const tracker = this.tracker();
      if (!_.isEqual(tracker,  this._tracker) && this.id > 0) {
        console.log('TrackerService CurrentTracker tracker', tracker);
        this.trackerService.update.set({
          id: this.id,
          tracker
        });
      }
    });
  }

  setHeadline(id: number) {
    // console.assert(typeof id == 'number', 'setHeadline not id');
    if (id < 0) {
      this.headline = 'Current Tracker';
    } else {
      this.headline = `Tracker for ID: ${id}`;
    }
  }
}

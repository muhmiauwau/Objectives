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

  tracker:any = model({});

  // updatedTracker: any = computed(() => {
  //   const panelTracker = this.trackerService.panelTracker();
  //   const tracker = this.tracker()
  //   return {tracker};
  // })


  constructor() {
    effect(async () => {
      const panelTracker = this.trackerService.panelTracker();
      if (panelTracker && panelTracker !== this.tracker()) {
        if (panelTracker.id  !== this.id ){
          this.id = panelTracker.id
          this.tracker.set(panelTracker.tracker);
          this.setHeadline(panelTracker.id);
        }
      }

      const tracker = this.tracker();
      if (tracker && panelTracker?.tracker) {
        if (tracker !== panelTracker.tracker && panelTracker.id > 0) {
          console.log('TrackerService CurrentTracker tracker', tracker);
          this.trackerService.update.set(panelTracker);
        }
      }
    });
  }

  setHeadline(id: number) {
    console.assert(typeof id == 'number', 'setHeadline not id');
    if (id < 0) {
      this.headline = 'Current Tracker';
    } else {
      this.headline = `Tracker for ID: ${id}`;
    }
  }
}

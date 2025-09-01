import { Component, input, effect, inject, model, signal, ChangeDetectorRef, ChangeDetectionStrategy, computed } from '@angular/core';
import { TrackerService } from 'services/tracker.service';
import { NarratorService } from 'services/narrator.service';
import * as _ from 'lodash-es';
import ST from 'data/SillyTavern';
import { Tracker } from 'narrator-msg/tracker/tracker';

@Component({
  selector: 'app-narrator-msg',
  imports: [],
  templateUrl: './narrator-msg.html',
  styleUrl: './narrator-msg.less',
})
export class NarratorMsg {
  trackerService = inject(TrackerService);
  narratorService = inject(NarratorService);

  private cdr = inject(ChangeDetectorRef);
  _data: any = {};
  data: any = input<any>();
  dataObj: any = signal<any>(
    {
      id: -1,
      status: 'none',
      msg: '',
      tracker: {},
    },
    { equal: _.isEqual }
  );
  narratioStr: string = '';

  tracker = computed(() => {
    const data = this.dataObj()
    return data?.tracker
  });

  // activeInPanel: signal<boolean> = false

  // status = "";

  // @HostBinding('attr.status') status = "none"

  // @HostBinding('attr.data-feedback') feedback: any = ""

  // message = signal('');
  // state = computed(() => (this.message() ? 'opened' : 'closed'));

  constructor() {
    // this.trackerService.update.on(({id, tracker}: {id: number, tracker: unknown}) => {
    //   // if(id !== this.dataObj().id) return;
    //   // this.dataObj.set({...this.dataObj(), tracker})
    // });

    effect(async () => {
      const update = this.trackerService.update();
      if (update && update.id == this.dataObj().id) {
        console.log('TrackerService update', update);
        this.dataObj.set({ ...this.dataObj(), tracker: update.tracker });
      }

      const tracker: any = this.tracker();
      if (tracker && tracker !== this.dataObj().tracker) {
        if (_.size(tracker) > 0) {
          console.log(' this.tracker', tracker, this.dataObj());
          this.dataObj.set({ ...this.dataObj(), tracker, msg: tracker.newscene });
          ST().chat[this.dataObj().id].narratorObj = this.dataObj();
          ST().chat[this.dataObj().id].mes = tracker.newscene;

          await ST().saveChat();

          console.log(' this.tracker after', ST().chat[this.dataObj().id]);
        }
      }

      // console.log(this.dataObj());
      // minimal, robust parsing: accept object or JSON-string
      const data = this.data();
      if (data && data !== this._data) {
        this._data = data;
        this.dataObj.set(JSON.parse(data));

        // if(this.dataObj().tracker){
        //   console.log("this.dataObj().tracker", this.dataObj().tracker)
        //   this.tracker.set((this.dataObj().tracker))
        // }

        // // feedback
        // console.log('daaaaddddd status 1 --', this.dataObj().status);
        // if (this.dataObj().status !== 'init') return;

       

        // tracker = await this.narratorService.callTracker(this.dataObj());
        // tracker.newscene = tracker?.newscene?.replace(/([<,>].)/g, '');
        // // this.tracker.set(tracker)
        // this.dataObj.set({ ...this.dataObj(), tracker });

        // console.log('daaaaddddd tracker', tracker);
        // // setTimeout(() => {
        // this.sendDone(tracker.newscene);
        // // }, 500);
      }
    });
  }

  sendDone(msg: any) {
    if (this.dataObj().status !== 'init') return;
    console.log('NarratorMsg sendDone - ', 'done', this.dataObj().id);
    const newData = this.dataObj();
    newData.status = 'done';
    newData.msg = msg;
    this.dataObj.set(newData);
    console.log('NarratorMsg sendDone 2- ', 'done', this.dataObj());
    this.narratorService.narratorData.set(this.dataObj());
    this.cdr.markForCheck();
  }

  openInPanel() {
    const id = this.dataObj().id;
    const tracker = {...this.dataObj().tracker};
    console.log('TrackerService openInPanel', id, tracker);

    this.trackerService.panelTracker.set({
      id,
      tracker,
    });
  }
}

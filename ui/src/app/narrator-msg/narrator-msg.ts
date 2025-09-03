import { Component, input, effect, inject, model, signal, ChangeDetectorRef, ChangeDetectionStrategy, computed } from '@angular/core';
import { TrackerService } from 'services/tracker.service';
import { TrackerStatusService } from 'services/tracker-status.service';

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
  trackerStatusService = inject(TrackerStatusService);
  narratorService = inject(NarratorService);

  private cdr = inject(ChangeDetectorRef);
  _id: any = -1;
  _data: any = {};
  data: any = input<any>();
  _mode: any = {};
  mode: any = input<any>();
  id: any = input<any>();
  narratioStr: string = '';

  tracker:any = signal({});

  status:any = signal("init");
  workflow:any = signal([]);


  constructor() {
    // this.trackerService.update.on(({id, tracker}: {id: number, tracker: unknown}) => {
    //   // if(id !== this.dataObj().id) return;
    //   // this.dataObj.set({...this.dataObj(), tracker})
    // });

    const workflow = this.trackerStatusService.getWorkflow("new")
    this.workflow.set(workflow)

    effect(async () => {
      const id = this.id()
      if (id && id !== this._id) {
        this._id = id

      }

      
      const statusAll:any = this.trackerStatusService.statusAll()
      if (statusAll &&  this.mode() != "new") {
          // console.log("Tracker id", id, this.trackerStatusService.get(id))
          this.status.set("done")

          const tracker = this.trackerService.get(id);
          if(tracker){
            // console.log("Tracker statusAll", tracker)
            this.tracker.set(tracker)
          }
      }


      const update = this.trackerService.update();
      if (update && update.id == this.id()) {
        // console.log('TrackerService update', update);
        this.tracker.set({ ...update.tracker });
      }

      const statusUpdate:any = this.trackerStatusService.statusUpdate()
      if (statusUpdate) {
        if (statusUpdate.id == this.id()) {
          console.log('TrackerService statusUpdate', statusUpdate);
          this.status.set(statusUpdate.status);
        }
      }


      const tracker: any = this.tracker();
      if (tracker && tracker !== this.tracker()) {
        if (_.size(tracker) > 0) {
          // console.log(' this.tracker', tracker, this.tracker());
          this.tracker.set({...tracker});
          ST().chat[this.id()].tracker = this.tracker();
          ST().chat[this.id()].mes = _.get(this.tracker(), ["newscene"],"");

          await ST().saveChat();

          // console.log(' this.tracker after', ST().chat[this.id()]);
        }
      }


      const mode = this.mode()
      if (mode && mode !== this._mode) {
          this.changeMode(mode)
      }
    });
  }


  async changeMode(mode:string, regen:boolean = false){
    this._mode = mode;

    // const workflow = this.trackerStatusService.getWorkflow(mode)
    // this.workflow.set(workflow)



    if(mode == "new"){
      const tracker = await this.trackerService.segmentedTracker(this.id(), regen);
      tracker.newscene = (tracker?.newscene || "").replace(/([<,>].)/g, '');
      this.tracker.set(tracker);

      await this.trackerService.saveTracker(this.id(), tracker)
      this.status.set("done");
      this.narratorService.narratorDone.set(!this.narratorService.narratorDone())
    }
  }





  openInPanel() {
    const id = this.id();
    const tracker = structuredClone(this.tracker());

    this.trackerService.panelTracker.set({
      id,
      tracker,
    });
  }

  reGenerate(){
    // const workflow = this.trackerStatusService.getWorkflow("new")
    // this.workflow.set(workflow)
    // this.status.set("init");

    // console.log( "  this.workflow  this.workflow  this.workflow", this.workflow);
    
    this.changeMode("new", true)
  }
}

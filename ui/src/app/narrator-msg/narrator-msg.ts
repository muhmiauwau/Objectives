import { Component, input, effect, inject, model, signal, ChangeDetectorRef } from '@angular/core';
import { NarratorService } from 'services/narrator.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-narrator-msg',
  imports: [],
  templateUrl: './narrator-msg.html',
  styleUrl: './narrator-msg.less',
})
export class NarratorMsg {
  narratorService = inject(NarratorService);

  private cdr = inject(ChangeDetectorRef);
  _data: any = {};
  data: any = input<any>();
  dataObj: any = signal<any>( {
    id:-1,
    status:"none",
    msg:"",
    tracker: {}
  }, {equal: _.isEqual});
  narratioStr: string = '';
  // status = "";

  // @HostBinding('attr.status') status = "none"

  // @HostBinding('attr.data-feedback') feedback: any = ""

  // message = signal('');
  // state = computed(() => (this.message() ? 'opened' : 'closed'));

  constructor() {
    effect(async () => {

      console.log(this.dataObj())
      // minimal, robust parsing: accept object or JSON-string
      const data = this.data();
      if (data && data !== this._data) {
        this._data = data;
        this.dataObj.set(JSON.parse(data))

        // feedback
        console.log('daaaaddddd status 1 --', this.dataObj().status);
        if (this.dataObj().status !== 'init') return;
 
        const tracker = await this.narratorService.callTracker(this.dataObj())

        this.dataObj.set({...this.dataObj(), tracker})

        console.log('daaaaddddd status 1 -', this.dataObj().status);
        // setTimeout(() => {
          this.sendDone("");
        // }, 500);
      }
    });
  }

  sendDone(msg:any) {
    if (this.dataObj().status !== 'init') return;
    console.log('NarratorMsg sendDone - ', 'done', this.dataObj().id);
    const newData = this.dataObj()
    newData.status = "done"
    newData.msg = msg
    this.dataObj.set(newData)
     console.log('NarratorMsg sendDone 2- ', 'done', this.dataObj());
    this.narratorService.narratorData.set(this.dataObj());
    this.cdr.markForCheck()
  }
}

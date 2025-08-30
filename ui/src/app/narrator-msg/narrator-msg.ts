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
  data: any = input<any>();
  dataObj: any = signal<any>( {
    id:-1,
    status:"none",
    msg:""
  }, {equal: _.isEqual});
  narratioStr: string = '';
  // status = "";

  // @HostBinding('attr.status') status = "none"

  // @HostBinding('attr.data-feedback') feedback: any = ""

  // message = signal('');
  // state = computed(() => (this.message() ? 'opened' : 'closed'));

  constructor() {
    effect(async () => {
      // minimal, robust parsing: accept object or JSON-string
      const data = this.data();
      if (data && JSON.parse(data) !== this.dataObj) {
        this.dataObj.set(JSON.parse(data))

        // feedback
        console.log('daaaaddddd status 1 --', this.dataObj().status);
        if (this.dataObj().status !== 'init') return;
 
        const msg = await this.narratorService.callNarrator(this.dataObj())
        // msg
        // this.dataObj.set()

        console.log('daaaaddddd status 1 -', this.dataObj().status);
        // setTimeout(() => {
          this.sendDone(msg);
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

import { Component, input, effect, inject, model, signal, ChangeDetectorRef } from '@angular/core';
import { NarratorService } from 'services/narrator.service';
import * as _ from 'lodash-es';
import ST from 'data/SillyTavern';
import { Tracker } from 'narrator-msg/tracker/tracker';


@Component({
  selector: 'app-narrator-msg',
  imports: [Tracker],
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

  tracker = model({})

  // status = "";

  // @HostBinding('attr.status') status = "none"

  // @HostBinding('attr.data-feedback') feedback: any = ""

  // message = signal('');
  // state = computed(() => (this.message() ? 'opened' : 'closed'));

  constructor() {
    effect(async () => {


      const tracker = this.tracker();
      if (tracker && tracker !== this.dataObj().tracker) {
        if(_.size(tracker) > 0){
          console.log(" this.tracker", tracker, this.dataObj())
          ST().chat[this.dataObj().id].narratorObj.tracker = tracker
          await ST().saveChat();

        }
         
          

      }

      

      console.log(this.dataObj())
      // minimal, robust parsing: accept object or JSON-string
      const data = this.data();
      if (data && data !== this._data) {
        this._data = data;
        this.dataObj.set(JSON.parse(data))

        if(this.dataObj().tracker){
          console.log("this.dataObj().tracker", this.dataObj().tracker)
          this.tracker.set((this.dataObj().tracker))
        }

        
         

        // feedback
        console.log('daaaaddddd status 1 --', this.dataObj().status);
        if (this.dataObj().status !== 'init') return;
 
        
        let tracker = {
    "newscene": "<not needed>",
    "time": "14:02:35; 10/16/2024 (wednesday)",
    "location": "quiet corner table near window, the bookworm café, old town district, munich, germany",
    "weather": "partly cloudy, mild autumn afternoon",
    "topics": {
        "primarytopic": "undressing",
        "emotionaltone": "surprised",
        "interactiontheme": "awkward"
    },
    "characterspresent": [
        "lara",
        "lena"
    ],
    "characters": {
        "lara": {
            "hair": "long brown hair flowing over shoulders",
            "makeup": "natural look with light mascara and lip balm",
            "outfit": "cream-colored knit sweater; dark wash skinny jeans; brown leather ankle boots; silver pendant necklace; delicate silver bracelet; light blue lace balconette bra; light blue lace bikini panties matching the bra",
            "stateofdress": "fully undressed, all clothing items discarded on floor near table",
            "postureandinteraction": "standing completely naked, appearing relaxed while lena looks surprised"
        },
        "lena": {
            "hair": "shoulder-length brown hair, neatly styled",
            "makeup": "subtle natural makeup with light foundation and neutral lip color",
            "outfit": "navy blue cardigan over white cotton blouse; gray tweed trousers; brown leather loafers; tortoiseshell reading glasses on table; silver stud earrings; beige seamless t-shirt bra; beige seamless briefs matching the bra",
            "stateofdress": "fully dressed, slightly formal but comfortable",
            "postureandinteraction": "looking at lara with surprise, slight blush on cheeks, maintaining eye contact but appearing flustered"
        }
    }
}

        tracker = await this.narratorService.callTracker(this.dataObj())

        this.tracker.set(tracker)
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

import { Component ,effect,signal, model, inject} from '@angular/core';
import { NarratorService } from 'services/narrator.service';
import * as _ from 'lodash-es';
import ST from 'data/SillyTavern';
import { Tracker } from 'narrator-msg/tracker/tracker';

@Component({
  selector: 'app-current-tracker',
  imports: [Tracker],
  templateUrl: './current-tracker.html',
  styleUrl: './current-tracker.less'
})
export class CurrentTracker {
  
  narratorService = inject(NarratorService);
  headline = "Current Tracker"
  narratioStr: string = '';

  tracker = model({})
  constructor() {


    this.narratorService.getCurrentTracker().then((tracker:any) => {
        this.tracker.set(tracker)
    })
    
    

    console.log("CurrentTracker", this.narratorService.getCurrentTracker())

    effect(async () => {


      const narratorData = this.narratorService.narratorData()
      if(narratorData && narratorData?.tracker !== this.tracker()){
        this.tracker.set(narratorData?.tracker)
      }

      
      

      // console.log(this.dataObj())
      // // minimal, robust parsing: accept object or JSON-string
      // const data = this.data();
      // if (data && data !== this._data) {
      //   this._data = data;
      //   this.dataObj.set(JSON.parse(data))

      //   if(this.dataObj().tracker){
      //     console.log("this.dataObj().tracker", this.dataObj().tracker)
      //     this.tracker.set((this.dataObj().tracker))
      //   }
      // }

       
    });
  }
}

import { Component, effect, inject,signal, input } from '@angular/core';
import { TrackerService } from 'tracker/services/tracker.service'

@Component({
  selector: 'app-mes-tracker',
  imports: [],
  templateUrl: './mes-tracker.html',
  styleUrl: './mes-tracker.less'
})
export class TrackerMesTracker {
  Tracker = inject(TrackerService);

  init:boolean = false;
  id:any = input(-1)

  tracker:any = signal({})


  constructor(){


    effect(async () => {

      const id = this.id()
      if(id && !this.init){
        const tracker = await this.Tracker.get(id)
        console.warn(tracker)
        this.tracker.set(tracker)
     
      }

    })
  }



  

  openInPanel() {
     const id = this.id();
    // const tracker = structuredClone(this.tracker());
    this.Tracker.openInPanel(id)
    // const id = this.id();
    // const tracker = structuredClone(this.tracker());

    // this.trackerService.panelTracker.set({
    //   id,
    //   tracker,
    // });
  }

  reGenerate(){
    // this.changeMode("new", true)
  }
}

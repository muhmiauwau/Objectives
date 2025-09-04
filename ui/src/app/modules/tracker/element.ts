import { Component, inject } from '@angular/core';
import { TrackerService } from 'tracker/services/tracker.service'


@Component({
  selector: 'tracker-element',
  imports: [],
  templateUrl: './element.html',
  styleUrl: './element.less'
})
export class TrackerElement {
  private Tracker = inject(TrackerService);


  headline: string = 'Tracker panel';

  constructor(){
    this.Tracker.init()
  }


}

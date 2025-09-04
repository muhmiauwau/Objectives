import { Injectable, inject, signal} from '@angular/core';
import * as _ from 'lodash-es';
import { MutationObserverService } from 'tracker/services/mutation-observer.service'
import { EventStoreService } from 'tracker/services/event-store.service'

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private MutationObserver = inject(MutationObserverService);
  private EventStore = inject(EventStoreService);

  panelTracker: any = signal({})

  init(){
    console.warn("TrackerService, init")
    this.EventStore.init()
    this.MutationObserver.observeChat()

    setTimeout(() => {
        this.openInPanel(2)
    }, 2000);
    
  }



   async get(mesId:number){
    if(!mesId) return;
    const tracker =  this.EventStore.get(mesId)
    return tracker

  }

  async openInPanel(mesId:number){
     if(!mesId) return;
    const tracker = await this.get(mesId)
    this.panelTracker.set(tracker)
  }
 
}

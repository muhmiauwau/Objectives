import { Injectable, inject} from '@angular/core';
import * as _ from 'lodash-es';
import { MutationObserverService } from 'tracker/services/mutation-observer.service'
import { EventStoreService } from 'tracker/services/event-store.service'

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private MutationObserver = inject(MutationObserverService);
  private EventStore = inject(EventStoreService);

  init(){
    console.warn("TrackerService, init")
    this.EventStore.init()
    this.MutationObserver.observeChat()
  }



   async get(mesId:number){
    if(!mesId)return;
    const tracker =  this.EventStore.get(mesId)
    return tracker

  }
 
}

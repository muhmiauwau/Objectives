import { Injectable, inject, signal } from '@angular/core';
import * as _ from 'lodash-es';
import { MutationObserverService } from 'tracker/services/mutation-observer.service';
import { EventStoreService } from 'tracker/services/event-store.service';

import ST from 'data/SillyTavern';
const { eventSource, event_types } = ST();

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private MutationObserver = inject(MutationObserverService);
  private EventStore = inject(EventStoreService);

  macroKey: string = `trackerA`
  panelTracker: any = signal({});

  init() {
    console.warn('TrackerService, init');
    this.EventStore.init();
    this.MutationObserver.observeChat();

    setTimeout(() => {
      this.openInPanel(2);
    


      ST().setExtensionPrompt(
          `objectives_tracker_prompt`,
          `{{${this.macroKey}}}`,
          1,
          0,
          false,
          0,
      );

    }, 2000);


    ST().registerMacro(this.macroKey, () => {
      const id = ST().chat.length -2 
      const state = this.EventStore.get(id)


// ${JSON.stringify(state.fields)} 

      // const data= JSON.stringify(state.fields)
      //@ts-ignore
      const data = window.Objectives.jsonToYAML(state.fields)
      return `## Current State
${data}
## Important Rules
- "Current State" is the definitive and authoritative source of information.
- All previous information is superseded by "Current State".
- Take "Current State" into account when generating subsequent messages, but do not directly reference or repeat its contents.
` 

    });


  }


  getForPrompt(){
    return `{{trackerA}} -- `
  }

  async get(mesId: number) {
    if (!mesId) return;
    const tracker = this.EventStore.get(mesId);
    return tracker;
  }

  async save(stateSnapshot: any) {
    this.EventStore.updateFromStateSnapshot(stateSnapshot);
    await ST().saveChat();
  }

  async openInPanel(mesId: number) {
    if (!mesId) return;
    const tracker = await this.get(mesId);
    this.panelTracker.set(tracker);
  }
}

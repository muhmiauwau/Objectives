import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';

import ST from 'data/SillyTavern';
const { eventSource, event_types } = ST();

@Injectable({
  providedIn: 'root',
})
export class MutationObserverService {
  observer: any;

  constructor() {
    
    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length === 0 && mutation.removedNodes.length === 0) continue;

        // Verarbeiter für mes-Elemente
        const processMesElements = async (nodes: NodeList, type: 'added' | 'removed') => {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            const element = node as HTMLElement;
            if (element.classList.contains('mes')) {
              // console.log(`mes-Element ${type}:`, element);
              const id: string | null = element.getAttribute('mesid');
              if (type == 'added') {
                if (id == '0' || id == null) continue;
                await new Promise(resolve => setTimeout(resolve, 200));
                element.insertAdjacentHTML(
                'beforeend',
                `<objectives-tracker-mes-tracker id="${id}"></objectives-tracker-mes-tracker>`
                );
              }
              // Hier deine Logik
            }
          }
        };

        if (mutation.addedNodes.length > 0) {
          processMesElements(mutation.addedNodes, 'added');
        }

        if (mutation.removedNodes.length > 0) {
          processMesElements(mutation.removedNodes, 'removed');
        }
      }
    });

    

    // eventSource.on(event_types.CHAT_CHANGED, async (chatId: string) => {
    //     this.disconnect()
    //     this.observeChat()
        
    // });   
  }

  observeChat() {
    const chatDiv: HTMLDivElement = document.getElementById('chat') as HTMLDivElement;

    if (!chatDiv) {
      throw new Error('chat Div nicht gefunden');
    }
    this.observer.observe(chatDiv, { childList: true, subtree: false });
  }

  disconnect(){
    this.observer.disconnect();
  }
}

import { Injectable, inject, signal } from '@angular/core';
import ST from 'data/SillyTavern';
import { UtilsService } from 'services/utils.service';
import { StoreService } from 'services/store.service';

@Injectable({ providedIn: 'root' })
export class PanelService {
  private utils = inject(UtilsService);
  private store = inject(StoreService);

  persons = signal<any[]>([]);
  hasActiveChat = signal<boolean>(false);
  view = signal<'list' | 'detail'>('list');
  selectedPerson = signal<any | null>(null);

  constructor() {
    this.loadPersons();
    try {
      const state = !!(ST().chatMetadata?.chat_id_hash && ST().chatMetadata?.chat_id_hash !== 0);
      this.hasActiveChat.set(state);
    } catch (e) {
    }
    ST().eventSource.on(ST().eventTypes.CHAT_CHANGED, () => {
      try {
        const state = !!(ST().chatMetadata?.chat_id_hash && ST().chatMetadata?.chat_id_hash !== 0);
        this.hasActiveChat.set(state);
      } catch (e) {}
      this.resetForNewChat();
    });
  }

  loadPersons() {
    const newPersons = this.utils.getPersonsOfcurrentChat() || [];
    this.persons.set([...newPersons]);
  }

  resetForNewChat() {
    this.loadPersons();
    this.selectedPerson.set(null);
    this.setView('list');
  }

  setView(v: 'list' | 'detail') {
    this.view.set(v);
    try {
      this.store.setUI('PanelListView', v);
    } catch (e) {
    }
  }

  openDetail(person: any) {
    this.selectedPerson.set(person);
    this.setView('detail');
  }

  openList() {
    this.selectedPerson.set(null);
    this.setView('list');
  }
}

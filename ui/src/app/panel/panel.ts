import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';

import { PanelList } from 'panel/list/list';


@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [PanelList],
  templateUrl: './panel.html',
  styleUrl: './panel.less',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class Panel {
  private store = inject(StoreService);
  // private cdr = inject(ChangeDetectorRef);
  headline = global_const.MODULE_NAME;

  title = signal('objectives');
  hasActiveChat = signal(!!(ST().chatMetadata?.chat_id_hash !== 0));

  constructor(){

    ST().eventSource.on(ST().eventTypes.CHAT_CHANGED, () => {
      const state = !!(ST().chatMetadata?.chat_id_hash !== 0)
      this.hasActiveChat.set(state)
    });
  }




}

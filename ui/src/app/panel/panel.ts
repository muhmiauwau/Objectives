import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { global_const } from 'data/base';
import { chatMetadata, eventSource, eventTypes} from 'data/SillyTavern';

import { PanelList } from 'panel/list/list';


@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [PanelList],
  templateUrl: './panel.html',
  styleUrl: './panel.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Panel {
  private store = inject(StoreService);
  private cdr = inject(ChangeDetectorRef);
  headline = global_const.MODULE_NAME;

  constructor(){
    console.log("angular ui", chatMetadata,this.store.get("test"))
    // this.store.set("test", "test22")
    eventSource.on(eventTypes.CHAT_CHANGED, () => {
        // store.setUI("personsSelected", "")
        // setPanelContent()

        console.log("dddd", chatMetadata?.chat_id_hash);
        this.cdr.detectChanges();
        
    })


  }


  hasActiveChat(){
    return !!(chatMetadata?.chat_id_hash !== 0)
  }



}

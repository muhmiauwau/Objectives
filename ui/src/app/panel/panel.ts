import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal , effect} from '@angular/core';
import { StoreService } from 'services/store.service';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';

import { PanelList } from 'panel/list/list';
import { PanelService } from 'services/panel.service';
import { PanelDetail } from './detail/detail';


@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [PanelList, PanelDetail],
  templateUrl: './panel.html',
  styleUrl: './panel.less',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class Panel {
  private store = inject(StoreService);
  public panel: PanelService = inject(PanelService);
  // private cdr = inject(ChangeDetectorRef);
  headline = global_const.MODULE_NAME;

  title = signal('objectives');
  // service is public; template may call `panel` directly (panel.view(), panel.hasActiveChat())

  dryRun:any;
  constructor(){
    
      // const view = this.store.getUI("PanelListView")
      // if (view) this.panel.setView(view === 'detail' ? 'detail' : 'list');

      // // PanelService handles CHAT_CHANGED and persons loading; keep hasActiveChat sync here
      // ST().eventSource.on(ST().eventTypes.CHAT_CHANGED, () => {
      //   const state = !!(ST().chatMetadata?.chat_id_hash !== 0)
      //   this.hasActiveChat.set(state)
      // });

    ST().eventSource.on(ST().event_types.GENERATE_AFTER_COMBINE_PROMPTS, (data:any) => {
       this.dryRun = data.dryRun

    });


    ST().eventSource.on(ST().event_types.GENERATE_AFTER_DATA, (payload:any) => {
      // console.log("✅ GENERATE_AFTER_DATA",this.dryRun,payload.prompt);
      
    });
  }




}

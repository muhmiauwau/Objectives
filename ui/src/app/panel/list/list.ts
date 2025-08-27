import { ChangeDetectionStrategy, ChangeDetectorRef,  Component, signal, inject } from '@angular/core';
import { chatMetadata, chat,powerUserSettings, eventSource, eventTypes} from 'data/SillyTavern';

import { UtilsService } from 'services/utils.service';

@Component({
  selector: 'panel-list',
  templateUrl: './list.html',
  styleUrl: './list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelList {
  utilsServie = inject(UtilsService);
  private cdr = inject(ChangeDetectorRef);

  viewHeadline = "List";
  protected readonly persons = signal(this.utilsServie.getPersonsOfcurrentChat());

  constructor(){
      // console.log("angular ui", chatMetadata,this.store.get("test"))
      // this.store.set("test", "test22")
      console.log("dddd", chatMetadata);
      eventSource.on(eventTypes.CHAT_CHANGED, (e:any,b :any) => {
          // store.setUI("personsSelected", "")
          // setPanelContent()
  
          console.log("dddd", chat , e,b, this.utilsServie.getPersonsOfcurrentChat());
          // this.persons.set(this.utilsServie.getPersonsOfcurrentChat())
          console.log("ddddd", powerUserSettings.personas[chatMetadata.persona])
          this.cdr.detectChanges();
          
      })
  
  
    }
}

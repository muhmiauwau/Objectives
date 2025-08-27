import { ChangeDetectionStrategy, ChangeDetectorRef,  Component, signal, inject } from '@angular/core';
import ST from 'data/SillyTavern';
import { StoreService } from 'services/store.service';
import { UtilsService } from 'services/utils.service';
import { PanelService } from '../../services/panel.service';

@Component({
  selector: 'panel-list',
  templateUrl: './list.html',
  styleUrl: './list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelList {
  utilsServie = inject(UtilsService);
  private cdr = inject(ChangeDetectorRef);
   private store = inject(StoreService);
  private panel: PanelService = inject(PanelService);

  viewHeadline = "List";
  personsSignal = this.panel.persons;
  selectedPerson = this.panel.selectedPerson;

  constructor(){

    // setTimeout(() =>{
    //     this.persons.set([]);

    //       console.log("dddd newPersons", this.persons());
    //   },1000)


  // PanelService handles CHAT_CHANGED and list updates
  }

  hasActiveChat(){
    return !!(ST().chatMetadata?.chat_id_hash !== 0);
  }

  openListView(person:any, index:number){
  console.log('PanelList: open detail', { person, index });
  this.panel.openDetail(person);
  }
}

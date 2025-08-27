import { ChangeDetectionStrategy, ChangeDetectorRef,  Component, signal, inject } from '@angular/core';
import ST from 'data/SillyTavern';

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
  personsSignal = signal<any[]>(this.utilsServie.getPersonsOfcurrentChat());

  constructor(){

    // setTimeout(() =>{
    //     this.persons.set([]);

    //       console.log("dddd newPersons", this.persons());
    //   },1000)


    // console.log("dddd", ST().chatMetadata);
    ST().eventSource.on(ST().eventTypes.CHAT_CHANGED,  (e:any, b:any)=>{
      console.log("dddd chat_id_hash", ST().chatMetadata?.chat_id_hash);
    
      // if ((ST().chatMetadata?.chat_id_hash === 0)) return [];
      console.log("dddd chat_id_hash OK");
        const newPersons =  this.utilsServie.getPersonsOfcurrentChat()
        this.personsSignal.set([...newPersons]);
        // //
        console.log("dddd newPersons",newPersons, this.personsSignal());
        this.cdr.detectChanges();
        return
    });
  }

  hasActiveChat(){
    return !!(ST().chatMetadata?.chat_id_hash !== 0);
  }
}

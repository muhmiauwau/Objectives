import { Component, inject } from '@angular/core';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [],
  templateUrl: './panel.html',
  styleUrl: './panel.less'
})
export class Panel {
    private store = inject(StoreService);
    headline = "lala";
    
    constructor(){

        // console.log("angular ui", this.store.get("tasks"))
    }

}

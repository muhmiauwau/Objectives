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
    headline = "lalas ";
    
    constructor(){

        console.log("angular ui", this.store.get("test"))

        // this.store.set("test", "test1")
    }

}

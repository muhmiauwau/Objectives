import { Component, model, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as _ from 'lodash-es';

@Component({
  selector: 'tracker-edit-field',
  imports: [
    FormsModule
  ],
  templateUrl: './edit-field.html',
  styleUrl: './edit-field.less'
})
export class TrackerEditField {

  type: any = input("")
  name: any = input("")
  field: any = model<any>();
  mesId: any = input("")
  validFrom: any = input("")


  constructor(){

  }



  onChange(path: any, $event: any, replace: boolean = false) {
      let newValue = $event.target.innerText.trim();
      // if (replace) {
      //   newValue = newValue.replaceAll('\n', ',');
      // }
  
      console.log("onChange save=", newValue, path)
  
      if (newValue !== _.get(this.field(), path)) {
         console.log("onChange save=", newValue)
        this.field.update((obj: any) => {
          _.set(obj, path, newValue);
          return obj;
        });
  
        this.field.set(structuredClone(this.field()));
      }
  
      // if (replace) {
      //   console.log('onChange replace', replace, this.replace(newValue));
      //   $event.target.innerHTML = this.replace(newValue);
      // }else{
      //    $event.target.innerHTML = newValue.trim();
      // }
      
      // this.toggleClass($event)
    }




    isValid(){
      const validFrom:number|number[] = this.validFrom()
      const mesId:number =  parseInt(this.mesId())
      let valid = false

      if(Array.isArray(validFrom)){
        valid = validFrom.includes(mesId) 
      }else{
        valid = (validFrom == mesId)
      }

      return valid
    }

}

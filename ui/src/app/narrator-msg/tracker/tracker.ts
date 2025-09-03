import { Component, model, input, computed, effect} from '@angular/core';
import * as _ from 'lodash-es';

@Component({
  selector: 'narrator-msg-tracker',
  imports: [],
  templateUrl: './tracker.html',
  styleUrl: './tracker.less',
})
export class Tracker {
  trackerFieldAry: any = ['location', 'time', 'weather', 'background', 'newscene'];
  _chnages: any = []
  changes: any = input([]);
  tracker: any = model({});
  mode: any = input<any>();


   constructor() {

    effect(async () => {
      const changes = this.changes()
      if (changes && changes !== this.changes) {
        this.changes = changes
      }
    })
  }

  log(data: any) {
    console.log('narrator-msg-tracker ', data);
  }

  entries(data: any) {
    const ary = Object.entries(data);
    return ary.map((entry: any) => {
      return {
        key: entry[0],
        value: entry[1],
      };
    });
  }

  replace(data: string) {
    // const data = data
    if(data && typeof data == "string"){
      return data.replaceAll(',', '<br>').replaceAll('\n', '<br>');
    }else{
      return data || ""
    }
   
  }

  onFocus(path: any, $event: any) {
    console.log('onFocus ', path, _.get(this.tracker(), path));
    $event.target.innerText = _.get(this.tracker(), path);
    //  $event.target.addCass  text_pole
    
    $event.target.classList.add('text_pole');
  }

  toggleClass($event: any){
    const cl:any = $event.target.classList
    const c:string = "text_pole"

    
    // $event.target.classList.add(c);
     if (cl.contains(c)) {
        cl.remove(c);
      } else {
        cl.add(c);
      }
  }

  onChange(path: any, $event: any, replace: boolean = false) {
    let newValue = $event.target.innerText.trim();
    if (replace) {
      newValue = newValue.replaceAll('\n', ',');
    }

    console.log("onChange save=", newValue, path)

    if (newValue !== _.get(this.tracker(), path)) {
       console.log("onChange save=", newValue)
      this.tracker.update((obj: any) => {
        _.set(obj, path, newValue);
        return obj;
      });

      this.tracker.set(structuredClone(this.tracker()));
    }

    if (replace) {
      console.log('onChange replace', replace, this.replace(newValue));
      $event.target.innerHTML = this.replace(newValue);
    }else{
       $event.target.innerHTML = newValue.trim();
    }
    
    this.toggleClass($event)
  }



  addItem(path: any) {
    const data = _.get(this.tracker(), path);
    if(!this.isArray(data)) return;
    this.tracker.update((obj: any) => {
      _.set(obj, path, [...data , ""]);
      return obj;
    });
    this.tracker.set(structuredClone(this.tracker()));
  }

  cleanItems(path: any) {
    const data:any = _.get(this.tracker(), path);
    if(!this.isArray(data)) return;
    const cleanData = data.filter((str:string) => str.trim() !== '')
    this.tracker.update((obj: any) => {
      _.set(obj, path, cleanData);
      return obj;
    });

    this.tracker.set(structuredClone(this.tracker()));
  }


  isArray(data:any){
    return Array.isArray(data)
  }



  checkChanges(path:string[]){
    const changes =  this.changes() || []
    if(changes.length == 0) return;
    const pathstr = path.join(".")
    return changes.includes(pathstr)
  }
}

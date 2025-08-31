import { Component, model, input } from '@angular/core';
import * as _ from 'lodash-es';

@Component({
  selector: 'narrator-msg-tracker',
  imports: [],
  templateUrl: './tracker.html',
  styleUrl: './tracker.less',
})
export class Tracker {
  trackerFieldAry: any = ['location', 'time', 'weather', 'background', 'newscene'];

  tracker: any = model({});
  mode: any = input<any>();

  // trackerObj: any = model({})

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
  }

  onChange(path: any, $event: any, replace: boolean = false) {
    let newValue = $event.target.innerText.trim();
    if (replace) {
      newValue = newValue.replaceAll('\n', ',');
    }

    if (newValue !== _.get(this.tracker(), path)) {
      this.tracker.update((obj: any) => {
        _.set(obj, path, newValue);
        return obj;
      });

      this.tracker.set({ ...this.tracker() });
    }

    if (replace) {
      console.log('onChange replace', replace, this.replace(newValue));
      $event.target.innerHTML = this.replace(newValue);
    }
  }
}

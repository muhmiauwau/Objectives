import { Component } from '@angular/core';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.less'
})
export class Settings {
  title = global_const.MODULE_NAME;
}

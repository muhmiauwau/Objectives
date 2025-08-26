import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { Panel } from './panel/panel';
import { Settings } from './settings/settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ Panel, Settings],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('objectives');
}

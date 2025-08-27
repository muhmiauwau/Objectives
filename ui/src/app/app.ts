import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { Panel } from './panel/panel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ Panel],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
   title = signal('objectives');

  
    
}

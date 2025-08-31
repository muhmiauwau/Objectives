import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { Panel } from './panel/panel';
import { trackerUserPromptTemplate, trackerSystemPromptTemplate } from '../data/narrator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
   title = signal('objectives');

   constructor(){
     console.log(trackerUserPromptTemplate, trackerSystemPromptTemplate) 
   }
    // 
    
}

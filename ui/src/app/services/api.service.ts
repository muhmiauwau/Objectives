import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import OpenAI from 'openai';
import ST from 'data/SillyTavern';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  private connectionId = 'openrouter - narrator 4'
  private openai:any;

  private token:string = "";

  private connection:any = {};

  

  init(){
    console.log("#######################", "init")
     this.getToken()
     this.connection = this.getConnection()

    const apiKey = localStorage.getItem('opToken') || "";
     this.openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        dangerouslyAllowBrowser: true
    });
  }

  async getToken(){
      const tokenResponse = await fetch('/csrf-token');
      const tokenData = await tokenResponse.json();
      this.token = tokenData.token;
  }



  getConnection(){
    const { ConnectionManagerRequestService } = ST();
    const profiles = ConnectionManagerRequestService.getSupportedProfiles();
    const find = _.find(profiles, (entry) => entry.name == this.connectionId);    
    if (!find) return {};
    return find
  }

  async cc(messages: any[], response_format: any, options = {}): Promise<any> {
    const startTime = performance.now();   

    let response:any = await fetch('api/plugins/objectives/foo', {
        method: 'POST',
        headers: {
            'X-CSRF-Token':this.token, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            b: {
              messages,
              response_format,
              ...options,
            },
            c: this.connection
        })
    })

    response = await response.json()

    console.warn(response)

    const endTime = performance.now();
    const time = endTime - startTime
    // const resultObj = this.formatResult(response, time)
    this.debugOutput(time, response.meta)
    return response
  }



  formatResult(response: any, time: number){
    const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '').trim()
    const meta = {... response.usage,  time}

    return {result: res, meta};
  }



  debugOutput(time: number, usage:any){
    if(!usage.completion_tokens) return;
    const ms = time;
    const token = usage.completion_tokens;
    const seconds = ms / 1000; // Convert ms to seconds first
    const result = (token / seconds).toFixed(2); // tokens per second
    const secondsFormatted = seconds.toFixed(2);

    console.warn(`CallTracker tokens: ${token} time: ${secondsFormatted}s , rate: ${result} TPS `)
    console.warn('callAPi', usage);
  }
}

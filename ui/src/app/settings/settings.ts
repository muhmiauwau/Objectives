import { Component, signal, effect, Signal } from '@angular/core';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';
const { eventSource, event_types, ConnectionManagerRequestService } = ST();
import * as _ from 'lodash-es';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.less',
})
export class Settings {
  title = global_const.MODULE_NAME;

  isNarrating: boolean = false
  // simple promise-controller to delay generation until other code resolves it
  blockPromise: Promise<void> | null = new Promise<void>((resolve) => { this.blockResolve = resolve; });
  private blockResolve: any = () => {};


  narratorMessage:any = {}
 

  getNarratorForId(id:number) {
    // console.log('✅ ✅ getNarratorForId');
    // return ST().chat[id].narrator
    // ST().chat
  }

  async saveNarratorForId(id:number, str: string) {
    
    // this.narratorMessage = {id, mes}

      const orgMsg:any = ST().chat[id] ;


    const naratorMsg = {
        ...orgMsg,
        name: "Narrator",
        mes: str
    } 
    naratorMsg.extra = naratorMsg.extra || {}
    naratorMsg.extra.isSmallSys = true
    // naratorMsg

     await ST().chat.push(naratorMsg);

    await ST().saveChat();

    this.narratorMessage = {id, str,naratorMsg}
    console.log('✅ ✅ saveNarratorForId', id, str,naratorMsg);

  }


  async setNarratorForId(id1:any) {
    const {id, str,naratorMsg} = this.narratorMessage
    if(!id)return;
    console.log('✅ ✅ setNarratorForId', id, id1);
    await ST().reloadCurrentChat();
  }






  constructor() {


     eventSource.on(event_types.USER_MESSAGE_RENDERED, async (id: number, type: any) => {

      console.log('✅ ✅ USER_MESSAGE_RENDERED', id, type);
       await this.setNarratorForId(id)
      // await ST().reloadCurrentChat();

      // _.debounce(()=>{ ST().reloadCurrentChat()} , 200)

    });

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, async (data: any, type: any) => {
      //  _.debounce(()=>{ ST().reloadCurrentChat()} , 200)
      // await ST().reloadCurrentChat();
      // if (type == 'inpersonate') return;
      // console.clear();
      
      // console.log('✅ ✅ USER_MESSAGE_RENDERED', data, type);
      //  const narratorMsg:string= `${data}: lalalaal jahdksad`
      // this.setNarratorForId(data, narratorMsg);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, async(data: any, type: any) => {
      // await ST().reloadCurrentChat();
    }); //MESSAGE_SWIPED


    // eventSource.on(event_types.MESSAGE_DELETED, (data: any, type: any) => {
    // }); //MESSAGE_SWIPED

    


    // eventSource.on(event_types.CHAT_CHANGED, (data: any, a: any) => {

    //   //@ts-ignore
    //   const $msgs = jQuery(`#chat .mes`)
    //   console.log('✅ ✅ CHAT_CHANGED', $msgs)

    //   $msgs.each((key:any,value:any) => {
        
    //     //@ts-ignore
    //     const ele = $(value)
    //     // if(ele.attr("ch_name") == "Narrator"){
    //     //   ele.find(".mesAvatarWrapper,.mes_block .flex-container.flex1.alignitemscenter * ").remove()
    //     // }

    //   });
    // });




    // eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, async(event: any) =>{
    //   if(event.dryRun) return;
    //   // console.log('✅ Final Prompt', event, event.chat, ST().chat)
    //   // event.chat = await this.runNarration(event.chat)
    //   // await this.blockPromise

    //   //  console.log('✅ Final Prompt After promise', event, event.chat, ST().chat)
    // });



    eventSource.on(event_types.MESSAGE_SENT, async (data:any) =>{
      console.log('✅ MESSAGE_SENT', data);
      // if(dryRun) return;
       await this.runNarration()
    });





    // eventSource.on(event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_BEFORE_COMBINE_PROMPTS', data, a);
    // });

    // ST().eventSource.on(ST().event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_AFTER_COMBINE_PROMPTS', data, a);
    // });

    // ST().eventSource.on(ST().event_types.GENERATE_AFTER_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_AFTER_COMBINE_PROMPTS', data, a);
    // });
  }


  isGenerationTypeAllowed(type:any) {
    if (ST().groupId) {
        if (type !== 'normal' && type !== 'group_chat') {
            return false;
        }
    } else {
        if (type) {
            return false;
        }
    }

    return true;
}


  async runNarration(){


    //@ts-ignore
    const id = jQuery(`#chat .mes:not([ch_name="Narrator"]`).last().attr("mesid")

     console.log('✅ Delaying generation for', 1, 'seconds', id);

// const naratingmsg= `${id}: jashdjksadh`
//              await this.saveNarratorForId(id, naratingmsg)
//  return
 

    const profiles = ConnectionManagerRequestService.getSupportedProfiles();
    
        console.log("######### profiles",profiles)
    
        // const pro = "objectives narrator api"
        const pro = "objectives api deepseek"
        const find = _.find(profiles, (entry)=> (entry.name == pro))
         console.log("######### find",find)

    // const last = chat.at(-1)

     console.log('✅ Delaying Finisch', 1, 'seconds', id);

     if (find){
     
            let msgs = ""

            Object.values(ST().chat).forEach((entry:any) => {

              if(entry.is_system) return;
              console.log(entry)
              msgs += `${entry.name}:${entry.mes};`
              
            });
            const prompt = `
Du bist der Erzähler eines Rollenspiels. Analysiere den bisherigen Verlauf. Greife ein, wenn ein Zeitsprung, Ortswechsel oder eine neue Szene logisch ist – zum Beispiel wenn sich Charaktere verabschieden, weggehen oder eine Handlung endet. Falls kein Eingreifen nötig ist, antworte ausschließlich mit "false".

**Vorgehen:**
1. Lies den Verlauf.
2. Entscheide, ob ein Zeitsprung, Ortswechsel oder eine neue Szene sinnvoll ist (z.B. bei Abschied, Ortswechsel, Tageswechsel).
3. Falls ja, führe die Handlung fort (max. 2-3 Sätze, dritte Person).
4. Falls nein, antworte nur mit "false".

**Kontext:**
Verlauf: ${msgs}

`


            
            // console.log("######### prompt",msgs,prompt)
            const response = await ConnectionManagerRequestService.sendRequest(
                find.id,
                prompt,
                4048,
                {
                    stream: false,
                    raw: true,
                    signal: null,
                    extractData: false,
                    includePreset: false,
                    includeInstruct: false,
                },
                { 
                    stream: false,
                    num_ctx: 1, 
                    options:{
                        stream: false,
                        temperature: 0
                    }
                }
            );
    
            const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || "").trim().toLowerCase()
    
            console.log("######### antwort",profiles, res,  response)
    
            // if(res !== "false"){
              const naratingmsg= `${id}: ${res}`
              await this.saveNarratorForId(id, naratingmsg)
            // }
        }

        // await new Promise(r => setTimeout(r, 10000));
    // return chat.push({role: last.role, content: naratingmsg})
    
    // setTimeout(() => {
    //   this.blockResolve()
    // },2000)
    // this.blockPromise = new Promise<void>((resolve) => { this.blockResolve = resolve; });

  }
}

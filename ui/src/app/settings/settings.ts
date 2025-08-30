import { Component, signal, effect, Signal, inject } from '@angular/core';
import { NarratorService } from 'services/narrator.service';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';
const { eventSource, event_types, ConnectionManagerRequestService } = ST();
import * as _ from 'lodash-es';

// @ts-ignore
const $ = jQuery

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.less',
})
export class Settings {
  narratorService = inject(NarratorService);
  title = global_const.MODULE_NAME;

  blocked: any = true

  isNarrating: boolean = false;
  // simple promise-controller to delay generation until other code resolves it
  blockPromise: Promise<void> | null = new Promise<void>((resolve) => {
    this.blockResolve = resolve;
  });
  private blockResolve: any = () => {};

  narratorMessage: any = {};

  getNarratorForId(id: number) {
    // console.log('✅ ✅ getNarratorForId');
    // return ST().chat[id].narrator
    // ST().chat
  }



  async saveNarratorForId(id: number, narratorObj: any) {

    console.log("saveNarratorForId call", id, narratorObj, ST().chat[id])
    const context = ST()
    // this.narratorMessage = {id, mes}
    const orgMsg: any = {...ST().chat[id]};
    // if(orgMsg.name)return 
    // orgMsg.name += " ✅"
    // context.addOneMessage(orgMsg)


    let tracker = {}
    if(!orgMsg.is_user){
      // @ts-ignore
      // tracker = await window.generateTracker(id)
     }

    //@ts-ignore
    window.currentTracker = tracker
    // const tracker = { ...(orgMsg.tracker || {}) } 

    // const tracker = jsonToYAML(mes.tracker);
		// 	mes.mes = `<tracker>${tracker}</tracker>\n\n`;
    orgMsg.tracker = {}

console.log("saveNarratorForId orgMsg", orgMsg)
     
    const naratorMsg = {
      orgMsg,
      name: 'Narrator',
      mes: "",
      narratorObj,
      swipes:[],
      extra: {
        isSmallSys:true
      }
    };
    // naratorMsg.extra = naratorMsg.extra ||{};
    naratorMsg.extra.isSmallSys = true;
    // naratorMsg.is_system = true
    // naratorMsg

    await ST().chat.push({...naratorMsg, name: 'Narrator'});
    await ST().saveChat();
    ST().addOneMessage(naratorMsg,{forceId: narratorObj.id, showSwipes: false})

    await new Promise(r => setTimeout(r, 200));
   
    try{
      //@ts-ignore
      const $element = $(`#chat .mes[mesid="${narratorObj.id}"]`)
      this.insertElement($element, narratorObj)
      console.log('aaaddddd runN saveNarratorForId', $element, `#chat .mes[mesid="${narratorObj.id}"]`);
       
    }catch(err:any){
      console.log(err)

    }

    this.blocked = false

    this.narratorMessage = { id, narratorObj, naratorMsg };
    // console.log('aaaddddd runN saveNarratorForId', $element, `#chat .mes[mesid="${narratorObj.id}"]`);

  }


  insertElement($element: any, narratorObj:any, mode: any = "init"){
    
    if($element){
       narratorObj.status = mode
      const $new = $(`<objectives-narrator-msg data='${JSON.stringify(narratorObj)}' ></objectives-narrator-msg>`)
      $element.find(".mes_text").html($new)
      if(mode == "init"){
        $(`#chat .mes:last-child`).addClass("last_mes").siblings().removeClass("last_mes")
        $(`#chat .mes:last-child`).get(0).scrollIntoView();
       
      }
    }
  }


  narratorData:any = {}
  constructor() {

  


    effect(async () => {
      const narratorData = this.narratorService.narratorData()
      if(narratorData && narratorData !== this.narratorData){
        this.narratorData = narratorData;
        console.log('daaaaddddd narratorData', this.narratorData); 

        ST().chat[this.narratorData.id].narratorObj = this.narratorData
        ST().chat[this.narratorData.id].mes = this.narratorData.msg
          await ST().saveChat();
         ST().executeSlashCommandsWithOptions("/trigger", {await:true})
        
       
      }
      
    });


    // eventSource.on("TRACKER_PREVIEW_UPDATED", async (id: number, type: any) => {
    //   console.log('✅ ✅ TRACKER_PREVIEW_UPDATED', id, type, ST().chat.length);



    //     //@ts-ignore
    //     window.currentTracker = ST().chat.at(-1).tracker
    // });
  
    



    // ST().registerMacro('tracker', function() {
    //   //@ts-ignore
    //   let tracker = window.jsonToYAML(window.currentTracker)
    //   return `\n\n<Tracker>${tracker}</Tracker>\n\n \n\n  Wichtig:Diese "<Tracker>" Informationen sind nur für deinen context, inkludiere die niemals in deine Antwort`;

    // });
   


     eventSource.on(event_types.USER_MESSAGE_RENDERED, async (id: number, type: any) => {
      console.log('✅ ✅ ✅ ✅ USER_MESSAGE_RENDERED', id, type);

      // await this.setNarratorForId(id);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, (id: number, type: any) => {
      console.log('✅ ✅ ✅ ✅ MESSAGE_RECEIVED', id, type, ST().chatMetadata);
      this.blocked = true
      
      // await this.setNarratorForId(id);
    });

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, async (id: any, type: any) => {
      console.log('✅ ✅ CHARACTER_MESSAGE_RENDERED', id, type);
      // await this.setNarratorForId(id);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, async (data: any, type: any) => {
      // await ST().reloadCurrentChat();
    }); //MESSAGE_SWIPED

    // eventSource.on(event_types.MESSAGE_DELETED, (data: any, type: any) => {
    // }); //MESSAGE_SWIPED

    eventSource.on(event_types.CHAT_CHANGED, (data: any, a: any) => {

      const last:any =  _.findLast(Object.values(ST().chat), (entry:any) => {
        return entry.name == "Narrator"
      })

      const chat = ST().chat
      // @ts-ignore
      $(`#chat .mes[ch_name="Narrator"]`).each((key, element:any) => {
        console.log(element)
        //@ts-ignore
        const $element = $(element)
        const narratorObj = chat.at($element.attr("mesid")).narratorObj
        this.insertElement($element, narratorObj, "done")
      });


        //@ts-ignore
      
      

      //@ts-ignore
      // window.currentTracker = {...(last.tracker||{})}



      // //@ts-ignore
      // const $msgs = jQuery(`#chat .mes`)
      // console.log('✅ ✅ CHAT_CHANGED', $msgs)

      // $msgs.each((key:any,value:any) => {

      //   //@ts-ignore
      //   const ele = $(value)
      //   // if(ele.attr("ch_name") == "Narrator"){
      //   //   ele.find(".mesAvatarWrapper,.mes_block .flex-container.flex1.alignitemscenter * ").remove()
      //   // }

      // });
    });

    eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, async (event: any) => {
      if (event.dryRun) return;
      console.log('✅ Final Prompt', event, event.chat, ST().chat);

        console.log('✅ blocked', this.blocked);
      if(!this.blocked) return;
       
      ST().stopGeneration()
      await this.runNarration();


      // event.chat = await this.runNarration(event.chat)
      // await this.blockPromise
      // await this.runNarration();
      // await new Promise(r => setTimeout(r, 20000));


      //  console.log('✅ Final Prompt After promise', event, event.chat, ST().chat)
    });


    eventSource.on(event_types.GENERATION_AFTER_COMMANDS, async (type:any, config:any, dryRun:any) =>{ 
      // if(dryRun) return;
      //  console.log('✅ GENERATION_AFTER_COMMANDS blocked', this.blocked);
      // if(this.blocked) return;
      // console.log('✅ GENERATION_AFTER_COMMANDS', type, config,dryRun);
      // await this.runNarration();

    });

    eventSource.on(event_types.MESSAGE_RECEIVED, async (id: any, type:string) => {
      if(type == "first_message") return;
      console.log('✅ MESSAGE_RECEIVED', id, type);
      // await this.runNarration();
    });

    eventSource.on(event_types.MESSAGE_SENT, async (id: any) => {
      console.log('✅ MESSAGE_SENT', id);
      // await this.runNarration();
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

  isGenerationTypeAllowed(type: any) {
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


  async runNarration() {
    let id = $(`#chat .mes`).last().attr('mesid');
    id = parseInt(id)

    console.log('daaaaddddd ✅ runNarration for', id, id + 1);


    const narratorObj = {
      id: id + 1,
      msg: `${id}:(dummy msg)`
    }
    await this.saveNarratorForId(id, narratorObj);
  }
  
}


  // const generationMutexEvents = {
  //     MUTEX_CAPTURED: 'GENERATION_MUTEX_CAPTURED',
  //     MUTEX_RELEASED: 'GENERATION_MUTEX_RELEASED',
  //   };

  //   function onGenerationMutexCaptured(event:any) {
  //     const capturedBy = event.extension_name;
  //     console.log('[daaaaddddd MUTEX] Generation mutex captured by', capturedBy);
  // }

  //   function onGenerationMutexReleased() {
  //     // capturedBy = NO_CAPTURES;
  //     console.log('[daaaaddddd MUTEX] Generation mutex released');
  // }

  //   eventSource.on(generationMutexEvents.MUTEX_CAPTURED, onGenerationMutexCaptured);
  //   eventSource.on(generationMutexEvents.MUTEX_RELEASED, onGenerationMutexReleased);
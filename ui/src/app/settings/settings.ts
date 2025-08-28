import { Component, signal, effect, Signal } from '@angular/core';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';
const { eventSource, event_types } = ST();

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.less',
})
export class Settings {
  title = global_const.MODULE_NAME;

  block: any = signal(new Promise(resolve => {})) 

 

  getNarratorForId(id:number) {
    // console.log('✅ ✅ getNarratorForId');
    // return ST().chat[id].narrator
    // ST().chat
  }

  setNarratorForId(id:number, str: string) {
   
    const msg:any = ST().chat[id] ;


    const naratorMsg = {
        ...msg,
        name: "Narrator",
        mes: str
    } 
    naratorMsg.extra = naratorMsg.extra || {}
    naratorMsg.extra.isSmallSys = true
    // naratorMsg

    ST().chat.push(naratorMsg);

    ST().saveChat();
//  console.log('✅ ✅ setNarratorForId', id, str);

    // const is_system = !!(msg?.is_system)
    console.log('✅ ✅ setNarratorForId', id, str, naratorMsg?.is_system);


      //@ts-ignore
      jQuery(`#chat .mes[mesid="${id}"]`).attr("mesid", id).after(`
          <div class="mes smallSysMes" mesid="${id}" ch_name="Narrator" is_user="${naratorMsg?.is_user } " is_system="false" bookmark_link swipeid="0" force_avatar="false" timestamp>
            <div class="mes_block">
                <div class="mes_text">
                    ${str}
                </div>
            </div>
          </div>
      `);


      console.log('✅ ✅ setNarratorForId', str, ST().chat);
    // ST().chat
//@ts-ignore
    $(`#chat > *:last-child`)[0].scrollIntoView(false)
   
  }

  // renderNarratorForId(id:number, str: any) {
  //   const text: string = str || this.getNarratorForId(id)
  //   if(!text) return;

  //   //@ts-ignore
  //   jQuery(`#chat .mes.narrator[mesid="${id}"]`).remove()
  //   //@ts-ignore
  //   jQuery(`#chat .mes[mesid="${id}"]`).before(`
  //         <div class="mes narrator" mesid="${id}" is_system="true">
  //         <div class="mes_block">
  //               <div class="mes_text">
  //                   ${text}
  //               </div>
  //           </div>
  //         </div>
  //         `);

  //     //@ts-ignore
  //   $(`#chat > *:last-child`)[0].scrollIntoView(false)


    
  // }


  injectNarrator(id:number, str: any) {
    

    
  }



  constructor() {


     eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, async(id: number, type: any) => {
      // if (type == 'inpersonate') return;
      // console.clear();
      console.log('✅ ✅ CHARACTER_MESSAGE_RENDERED', id, type);

      // const narratorMsg:string= `${data}: lalalaal jahdksad`
      // this.setNarratorForId(data, narratorMsg);

      this.block.set(new Promise(resolve => {}))

      //  await this.runNarration(id, type)

        console.log('✅ ✅ CHARACTER_MESSAGE_RENDERED', id, type);

    });

    // eventSource.on(event_types.USER_MESSAGE_RENDERED, (data: any, type: any) => {
    //   // if (type == 'inpersonate') return;
    //   // console.clear();
      
    //   console.log('✅ ✅ USER_MESSAGE_RENDERED', data, type);
    //    const narratorMsg:string= `${data}: lalalaal jahdksad`
    //   this.setNarratorForId(data, narratorMsg);
    // });

    // eventSource.on(event_types.MESSAGE_RECEIVED, (data: any, type: any) => {
    //   // if (type == 'inpersonate') return;
    //   // console.clear();
    //   console.log('✅ ✅ MESSAGE_RECEIVED', data, type);

    //   const narratorMsg:string= `${data}: lalalaal jahdksad`
    //   //@ts-ignore
    //   // jQuery(`#chat .mes[mesid="${data}"]`).before(`
    //   //     <div class="mes narrator" mesid="${data}" is_system="true">
    //   //     <div class="mes_block">
    //   //           <div class="mes_text">
    //   //               ${narratorMsg}
    //   //           </div>
    //   //       </div>
    //   //     </div>
    //   //     `);

    //   this.setNarratorForId(data, narratorMsg);
    // }); //MESSAGE_SWIPED


    // eventSource.on(event_types.MESSAGE_DELETED, (data: any, type: any) => {
    // }); //MESSAGE_SWIPED

    


    eventSource.on(event_types.CHAT_CHANGED, (data: any, a: any) => {

      //@ts-ignore
      const $msgs = jQuery(`#chat .mes`)
      console.log('✅ ✅ CHAT_CHANGED', $msgs)

      $msgs.each((key:any,value:any) => {
        
        //@ts-ignore
        const ele = $(value)
        // if(ele.attr("ch_name") == "Narrator"){
        //   ele.find(".mesAvatarWrapper,.mes_block .flex-container.flex1.alignitemscenter * ").remove()
        // }

      });
    });




    eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, (event: any) =>
      console.log('✅ Final Prompt', event, event.chat, ST().chat)
    );



    eventSource.on(event_types.GENERATION_AFTER_COMMANDS, async (type: any,config: any,dryRun: any) =>{
      if(dryRun)return;
      console.log('✅ Delaying generation for', 1, 'seconds',this.block(), type, config, dryRun);
        // await new Promise(resolve => setTimeout(resolve,  5000));

        
      // await this.block.effect(()=>{})

      // await this.runNarration(type, config)
      // console.log('[Stepped Thinking] Generation delay complete');
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




  async runNarration(id: number, type: any){
//@ts-ignore
    console.log('✅ Delaying generation for', 1, 'seconds', id, type);

    // //@ts-ignore
    // // const msgId = jQuery(`#chat .mes:not([ch_name="Narrator"]`).last().attr("mesid")

    //  console.log('✅ Delaying generation for', 1, 'seconds', msgId, type, config, );

    this.setNarratorForId(id, `${id};${type}: lorem ipsum`)

    await new Promise(resolve => setTimeout(resolve,  1));
  }
}

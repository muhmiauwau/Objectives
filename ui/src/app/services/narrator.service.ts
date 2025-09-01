import { Injectable, signal } from '@angular/core';
import * as _ from 'lodash-es';

import { trackerUserPromptTemplate, trackerSystemPromptTemplate } from 'data/narrator';

import ST from 'data/SillyTavern';

@Injectable({
  providedIn: 'root',
})
export class NarratorService {


  narratorData: any = signal(false);

  status: any = []
  statusUpdate: any = signal(false);

  setStatus(id: any, newStatus: string, data?: any) {
     console.log(`Status setzen ${id} auf '${newStatus}'`, this.status);
    // Finde den existierenden Status-Eintrag oder erstelle einen neuen
    const existingIndex = this.status.findIndex((item: any) => item.id === id);
    
    if (existingIndex !== -1) {
      // Aktualisiere den existierenden Status
      this.status[existingIndex].status = newStatus;
      this.status[existingIndex].lastUpdated = new Date().toISOString();
      
      // Füge Daten hinzu (z.B. Analyse-Ergebnisse)
      if (data !== undefined) {
        this.status[existingIndex].data = data;
      }
      
      // Triggere das statusUpdate Signal mit dem aktualisierten Eintrag
      this.statusUpdate.set(this.status[existingIndex]);
    } else {
      // Erstelle einen neuen Status-Eintrag
      const newEntry: any = {
        id: id,
        status: newStatus,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Füge Daten hinzu falls vorhanden
      if (data !== undefined) {
        newEntry.data = data;
      }
      
      this.status.push(newEntry);
      
      // Triggere das statusUpdate Signal mit dem neuen Eintrag
      this.statusUpdate.set(newEntry);
    }
    
   
  }

  // Hilfsmethode um den Status einer bestimmten ID abzurufen
  getStatus(id: any): string | null {
    const statusEntry = this.status.find((item: any) => item.id === id);
    return statusEntry ? statusEntry.status : null;
  }

  // Hilfsmethode um die Daten einer bestimmten ID abzurufen
  getStatusData(id: any): any {
    const statusEntry = this.status.find((item: any) => item.id === id);
    return statusEntry ? statusEntry.data : null;
  }

  // Hilfsmethode um den kompletten Status-Eintrag abzurufen
  getStatusEntry(id: any): any {
    return this.status.find((item: any) => item.id === id) || null;
  }

  // Hilfsmethode um zu prüfen ob eine Komponente fertig geladen ist
  isStatusDone(id: any): boolean {
    return this.getStatus(id) === 'done';
  }

  // Hilfsmethode um zu prüfen ob eine Komponente einen bestimmten Status hat
  hasStatus(id: any, status: string): boolean {
    return this.getStatus(id) === status;
  }

  // Hilfsmethode um alle Status abzurufen
  getAllStatus(): any[] {
    return [...this.status];
  }

  // Hilfsmethode um Status zu entfernen (cleanup)
  removeStatus(id: any): void {
    const index = this.status.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.status.splice(index, 1);
      this.statusUpdate.set(!this.statusUpdate());
    }
  }

  async callNarrator(data: any) {
    const { eventSource, event_types, ConnectionManagerRequestService } = ST();

    const profiles = ConnectionManagerRequestService.getSupportedProfiles();

    const id = data.id;

    console.log('######### profiles', profiles);

    const pro = 'objectives api deepseek';
    const find = _.find(profiles, (entry) => entry.name == pro);
    console.log('######### find', find);

    if (find) {
      let msgs: any = [];

      const chatArray = Object.values(ST().chat);
      chatArray.forEach((entry: any) => {
        if (entry.is_system) return;
        console.log(entry);
        msgs.push(`${entry.name}:${entry.mes}`);
      });
      const lastmsg = msgs.at(-1);

      msgs.join('\n');

      const triggerMap: any = {
        newscene: {
          hint: 'If the conversation contains an action or dialogue that clearly and definitively ends the current social interaction (e.g., saying goodbye and walking away, leaving a room, abruptly ending the conversation, falling asleep). This signals that the current scene is narratively complete and a new narrative unit begins.',
          example: 'The scene is complete',
          prompt: `Du bist ein neutraler Erzähler. Basierend auf dem Chatverlauf und der letzten Nachricht, beschreibe kurz und neutral in der dritten Person den Übergang zu einer neuen Szene (z.B. Zeitverlauf oder Ortswechsel). Vermeide jegliche Handlungen oder Beschreibungen von User oder Charakteren. Halte es rein narrativ und kontextuell.`,
        },
        location: {
          hint: 'when the current location should be described',
          example: 'The current location was not described.',
          prompt: `Du bist ein neutraler Erzähler. Basierend auf dem Chatverlauf und der letzten Nachricht, beschreibe kurz und neutral in der dritten Person die aktuelle location. Vermeide jegliche Handlungen oder Beschreibungen von User oder Charakteren. Halte es rein narrativ und kontextuell.`,
        },
        atmosphere: {
          hint: 'when the mood/atmosphere should be described',
          example: 'The atmosphere of the scene should be emphasized.',
          prompt: `Du bist ein neutraler Erzähler. Basierend auf dem Chatverlauf und der letzten Nachricht, beschreibe kurz und neutral in der dritten Person die aktuelle atmosphere. Vermeide jegliche Handlungen oder Beschreibungen von User oder Charakteren. Halte es rein narrativ und kontextuell.`,
        },
      };
      const themesList = Object.keys(triggerMap)
        .map((key: string) => `  - ${key} (${triggerMap[key].hint})`)
        .join('\n');

      const themesExamples = Object.keys(triggerMap)
        .map((key: string) => `  - ${key} (${triggerMap[key].example})`)
        .join('\n');

      // console.log(ST().substituteParamsExtended?.("User: {{user}}"))

      const analysePrompt = `
            History: [${lastmsg}]
            Last message: [${lastmsg}]
    
            You are an experienced conversation analyst.
            Your task:
            1. Analyze the last message in the chat history.
            2. Examine the previous history.
            3. Decide if any of the following aspects are missing or should be described:
    
            Possible topics (use only these exact labels):
            ${themesList}
    
            Response format: [Topic,Topic,...]
            If no intervention is necessary, reply with "false".
          
    
            Example responses:
            ${themesList}
            - false
    
            user == "{{user}}" 
            char == "{{char}}"
    
    
          `;

      async function callAPi(mode: string) {
        //@ts-ignore
        toastr.info(`callAPi: ${mode}`, 'objectives');

        const prefix = `Verlauf: [${msgs}]
            Letzte Nachricht: [${lastmsg}]
            
          `;
        let prompt = '';

        if (Object.keys(triggerMap).includes(mode)) {
          prompt += triggerMap[mode].prompt;
        } else {
          prompt += analysePrompt;
        }

        prompt = ST().substituteParamsExtended(prompt);

        console.log('######### callAPi prompt', prompt);

        prompt = `${prefix}\n\n${prompt}`;

        //  console.log('######### ',mode, Object.keys(triggerMap), Object.keys(triggerMap).includes(mode));

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
            options: {
              stream: false,
              temperature: 0.2,
              max_tokens: 300,
              presence_penalty: 0,
              frequency_penalty: 0,
              top_p: 1,
            },
          }
        );

        const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '')
          .trim()
          .toLowerCase();

        console.log('######### callAPi', profiles, res, response);

        //@ts-ignore
        toastr.info(`callAPi result: ${res}`, 'objectives');
        return res;
      }

      const analyseResult = await callAPi('init');
      if (analyseResult !== 'false') {
        const raw = analyseResult.replace(/[\[\]]/g, '').trim();
        const labels = raw.length
          ? raw
              .split(',')
              .map((l: any) => l.trim())
              .filter(Boolean)
          : [];

        // bekannte Trigger in triggerMap (Reihenfolge = Priorität)
        const knownTriggers = Object.keys(triggerMap);

        // Filtere Labels auf bekannte Trigger und sortiere nach Priorität (knownTriggers Reihenfolge)
        const orderedLabels = labels
          .filter((l: any) => knownTriggers.includes(l))
          .sort((a: any, b: any) => knownTriggers.indexOf(a) - knownTriggers.indexOf(b));

        let finalNarration = '';

        if (orderedLabels.length > 0) {
          // Für jedes gefundene Label parallel die spezifischen Prompts abrufen
          const promises = orderedLabels.map((label: any) => callAPi(label));
          const results = await Promise.all(promises);

          // Kombiniere die Ergebnisse: jeder Block bekommt ein Label-Präfix
          const combined = orderedLabels
            .map((label: any, i: any) => `(${label}) ${results[i]}`)
            .join('\n\n');

          finalNarration = `(Erzähler)(${orderedLabels.join(',')})\n${combined}`;
        } else {
          // Falls die Analyse keinen oder unverständlichen Label-Text geliefert hat,
          // speichere die Roh-Antwort als Narration (bisherige Verhalten / Fallback)
          finalNarration = `(Erzähler)(${analyseResult})\n${analyseResult}`;
        }

        // await this.saveNarratorForId(id, finalNarration);
        return finalNarration;
      }

      return false;
    }

    return false;
  }

  async callTracker(data:any) {
    
    // console.groupCollapsed(`callTracker ${data.id}`);
     const { eventSource, event_types, ConnectionManagerRequestService } = ST();

     async function callAPi(prompt:any) {

      //  const pro = 'objectives api deepseek';
      const pro = 'openrouter - narrator 2';
      const profiles = ConnectionManagerRequestService.getSupportedProfiles();
      const find = _.find(profiles, (entry) => entry.name == pro);
      console.log('Profile find', find);

      if(!find) return false;
       console.time(`callTracker`);
        console.log("callTracker prompt", prompt);
        const startTime = performance.now()
        const response = await ConnectionManagerRequestService.sendRequest(
          find.id,
          prompt,
          8000,
          {
            stream: false,
            signal: null,
            extractData: false,
            includePreset: false,
            includeInstruct: false,
            instructSettings: {},
          },
          {
            options: {
              // temperature: 0.2,
              // max_tokens: 300,
              // presence_penalty: 0,
              // frequency_penalty: 0,
              // top_p: 1,
            },
          }
        );

        /*
          inception/mercury 
            128K
            16.4K
            $0,25
            $1
            Fast but no cache

        */



         console.log('######### callAPi before', response);
        const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '')
          .trim()
          .toLowerCase();

        function calcTime(startTime:any, endTime:any, usage:any){
          const ms = endTime - startTime
        
          console.assert(usage.completion_tokens, "calcTime: mising usage.completion_tokens")
          const token =  usage.completion_tokens
          const seconds = ms / 1000; // Convert ms to seconds first
          const result = (token / seconds).toFixed(2); // tokens per second
          const secondsFormatted = seconds.toFixed(2);


          return `CallTracker tokens: ${token} time: ${secondsFormatted}s , rate: ${result} TPS `
        }
  
        console.log('######### callAPi', profiles, res, response); 
        const endTime = performance.now()
        console.timeEnd(`callTracker`);
        console.warn(calcTime(startTime, endTime, response.usage))
        console.warn("callAPi", response.usage) 
       
        

        return res;
      }

      // @ts-ignore
      const currentTracker = await this.getCurrentTracker()
      
    // const currentTracker = "\nNewScene: \"<not needed>\"\nTime: \"14:02:25; 10/16/2024 (Wednesday)\"\nLocation: \"Quiet corner table near window, The Bookworm Café, Old Town District, Munich, Germany\"\nWeather: \"Partly cloudy, mild autumn afternoon\"\nTopics:\n  PrimaryTopic: \"Introduction\"\n  EmotionalTone: \"Friendly\"\n  InteractionTheme: \"Conversational\"\nCharactersPresent: [\"Lara\", \"Lena\"]\nCharacters:\n  Lara:\n    Hair: \"Long brown hair flowing over shoulders\"\n    Makeup: \"Natural look with light mascara and lip balm\"\n    Outfit: \"Cream-colored knit sweater; Dark wash skinny jeans; Brown leather ankle boots; Silver pendant necklace; Delicate silver bracelet; Light blue lace balconette bra; Light blue lace bikini panties matching the bra\"\n    StateOfDress: \"Sweater removed, placed on chair back or nearby; wearing blouse underneath\"\n    PostureAndInteraction: \"In the process of removing sweater, smiling at Lena, appearing more relaxed\"\n  Lena:\n    Hair: \"Shoulder-length brown hair, neatly styled\"\n    Makeup: \"Subtle natural makeup with light foundation and neutral lip color\"\n    Outfit: \"Navy blue cardigan over white cotton blouse; Gray tweed trousers; Brown leather loafers; Tortoiseshell reading glasses on table; Silver stud earrings; Beige seamless t-shirt bra; Beige seamless briefs matching the bra\"\n    StateOfDress: \"Fully dressed, slightly formal but comfortable\"\n    PostureAndInteraction: \"Smiling back at Lara, adjusting books on the table, maintaining friendly eye contact\"\n\n"



    const lastChatMsg = ST().chat.at(-2)
    console.log("lastChatMsg currentTracker", lastChatMsg, currentTracker)
    const prompt = [
      {
          role: "system",
          content: ST().substituteParamsExtended(trackerSystemPromptTemplate,  {currentTracker})
        },
        {
            role: "user",
            content: trackerUserPromptTemplate 
        },
        {
          role: (lastChatMsg.is_user)? "user": "assistant",
          content: ST().substituteParamsExtended(`${((lastChatMsg.is_user)? "{{user}}": "{{char}}")}: ${lastChatMsg.mes}`)
        },
        {
            role: "system",
            content: "Answer only in english." 
        },
         {
            role: "system",
            content: "Important Rule for newscene: Fill this fields only if really nessary, do not descripe whats happening here. But if included It should set the setting for the new scene" 
        },

        
    ]


    const tracker = await callAPi(prompt)

    let newTracker;
	try {
		// if(extensionSettings.trackerFormat == trackerFormat.JSON) tracker = unescapeJsonString(tracker);
		const trackerContent = tracker.match(/<(?:tracker|Tracker)>([\s\S]*?)<\/(?:tracker|Tracker)>/);
		let result = trackerContent ? trackerContent[1].trim() : null;
    // @ts-ignore
		result = window.Objectives.yamlToJSON(result);
		newTracker = JSON.parse(result);
	} catch (e) {
		console.log("Failed to parse tracker:", tracker, e);
		// toastr.error("Failed to parse the generated tracker. Make sure your token count is not low or set the response length override.");
	}

// ```yaml

// console.log("Parsed tracker:", { newTracker });
// const result = false
    // console.groupEnd();
    return newTracker || "";

    
  }


  async getCurrentTracker():Promise<any> {
    const chat = {...ST().chat}

    if(_.size(chat) == 0){
      await new Promise(r => setTimeout(r, 100));
      return this.getCurrentTracker()
    }

    const filtered: any = _.filter(chat, (entry: any) =>{
      return _.has(entry,["narratorObj", "tracker"])
    })

    console.assert(filtered, "getCurrentTracker:_ no narratorObj found")
    if(!filtered) return {};

    const lastEntry:any = _.last(filtered)
    console.assert(lastEntry, "getCurrentTracker: no lastEntry found", chat)
    if(!lastEntry) return {};

    return lastEntry.narratorObj.tracker
  }


  lastMsgIsNarrator() {
    const last:any = ST().chat.at(-1)
    const isNarrator = _.has(last, ["narratorObj"])
    console.warn("lastMsgIsNarrator", last, isNarrator)
    return isNarrator
  }

}

import { Injectable, signal } from '@angular/core';
import * as _ from 'lodash-es';

import ST from 'data/SillyTavern';

@Injectable({
  providedIn: 'root',
})
export class NarratorService {
  narratorData: any = signal(false);

  async callNarrator(data:any) {
    const { eventSource, event_types, ConnectionManagerRequestService } = ST();

    const profiles = ConnectionManagerRequestService.getSupportedProfiles();

    const id = data.id

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
}

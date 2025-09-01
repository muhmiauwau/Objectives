import { Injectable, signal} from '@angular/core';
import * as _ from 'lodash-es';


import ST from 'data/SillyTavern';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

    narratorMsgDone: any = signal(false)

    getPersonsOfcurrentChat(){   

        if ((ST().chatMetadata?.chat_id_hash === 0)) return [];
        let chars = [];

        if(ST().groupId){
            const group = ST().groups.find((g:any) => g.id === ST().groupId);
            const memberIds = group ? group.members : [];
            const participants = ST().characters.filter((ch:any) => memberIds.includes(ch.avatar)).map((entry:any) => {
                return {
                    name: entry.name,
                    avatar: ST().getThumbnailUrl("avatar", entry.avatar),
                    isUser: false
                }
            });
            chars = participants;
        } else if(ST().characterId){
            chars.push({
                name: ST().characters[ST().characterId].name,
                avatar: ST().getThumbnailUrl("avatar", ST().characters[ST().characterId].avatar),
                isUser: false
            });
        }

        const personasInChat = _.uniq([...ST().chat].filter(msg => (msg.is_user == true)).map(entry => entry.name));
        personasInChat.push(ST().powerUserSettings.personas[ST().chatMetadata.persona]);

        const allPersonas: any[] = [];//await getUserAvatars(false);
        const personas = allPersonas.map((avatar:any) => {
            return {
                name: ST().powerUserSettings.personas[avatar],
                avatar: ST().getThumbnailUrl("persona", avatar),
                isUser: true
            }
        }).filter((ch:any) => personasInChat.includes(ch.name));

        const persons = [...chars, ...personas];
        return persons;
    }
}

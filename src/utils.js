const { lodash } = SillyTavern.libs;
const _ = lodash

import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { chat, getThumbnailUrl } from '/script.js';
import { getUserAvatars } from '/scripts/personas.js';
import { power_user } from '/scripts/power-user.js';
import { getContext } from '/scripts/extensions.js';

import {
    groups,
    selected_group,
} from '/scripts/group-chats.js';



export async function getPersonsOfcurrentChat(){   
    const context = getContext()

    let chars = []


    if(selected_group){
        const group = groups.find(g => g.id === selected_group);
        const memberIds = group ? group.members : [];
        const participants = context.characters.filter(ch => memberIds.includes(ch.avatar)).map(entry => {
            return {
                name: entry.name,
                avatar: getThumbnailUrl("avatar",entry.avatar),
                isUser: false
            }
        })

        

        chars = participants
    }else if(context.characterId){
        chars.push({
                name: context.characters[context.characterId].name,
                avatar: getThumbnailUrl("avatar",context.characters[context.characterId].avatar),
                isUser: false
            })
    }

    // chars = chars.map(entry => {
    //     return {
    //         name: entry,
    //         isUser: false
    //     }
    // })

    const personasInChat = _.uniq([...chat].filter(msg => (msg.is_user == true)).map(entry => entry.name ))

    const allPersonas = await getUserAvatars(false);
    const personas = allPersonas.map(avatar => {
        return {
            name: power_user.personas[avatar],
            avatar: getThumbnailUrl("persona",avatar),
            isUser: true
        }
    }).filter(ch => personasInChat.includes(ch.name));

    const persons = [...chars, ...personas]

    return persons
}

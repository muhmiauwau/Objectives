 import * as _ from 'lodash-es';

import ST from 'data/SillyTavern';

// @ts-ignore 
const helper:any = window.Objectives ;

const trackerDef = {
    "field-0": {
        "name": "newscene",
        "type": "STRING",
        "presence": "DYNAMIC",
        "prompt": "Only provide a transition sentence if an action or dialogue clearly and definitively ends the current social interaction (e.g., saying goodbye and leaving, exiting a room, abruptly ending the conversation, falling asleep). Otherwise, do not output anything.",
        "defaultValue": "",
        "exampleValues": [
            "Am nächsten morgen treffen sie sich wieder",
            "",
            ""
        ],
        "nestedFields": {}
    },
    "field-1": {
        "name": "time",
        "type": "STRING",
        "presence": "DYNAMIC",
        "prompt": "Adjust the time in **small increments**, ideally only a few seconds per update, to reflect natural progression, avoiding large jumps unless explicitly indicated (e.g., sleep, travel). Ensure that the time is appropriate for the setting (e.g., malls are typically open during certain hours). Use the 24-hour format: \"HH:MM:SS; MM/DD/YYYY (Day Name)\".",
        "defaultValue": "<Updated time if changed>",
        "exampleValues": [
            "09:15:30; 10/16/2024 (Wednesday)",
            "18:45:50; 10/16/2024 (Wednesday)",
            "15:10:20; 10/16/2024 (Wednesday)"
        ],
        "nestedFields": {}
    },
    "field-2": {
        "name": "background",
        "type": "STRING",
        "presence": "DYNAMIC",
        "prompt": "Describe only the visible, static environment as in a photograph: architecture, furniture, objects, colors, and lighting. Exclude people, actions, sounds, smells, and invisible context.",
        "defaultValue": "<Updated Background if location changed>",
        "exampleValues": [
            "A modern, minimalist conference room. A long, polished mahogany table dominates the center, surrounded by a dozen high-backed black leather chairs. One entire wall is a floor-to-ceiling window offering a panoramic view of the Manhattan skyline. The opposite wall is a large, blank white screen for presentations. Recessed LED lighting in the ceiling provides bright, even illumination.",
            "A large, high-ceilinged room with mirrored walls. Various weight machines and racks of dumbbells are arranged in neat rows. Bright, fluorescent lighting reflects off the polished rubber flooring. Large windows show a dark evening outside.",
            "A wide, art deco-lined sidewalk of pale terrazzo tile running parallel to a busy two-lane road. Across the road, a white sand beach and the turquoise Atlantic Ocean are visible. Palm trees provide dappled shade. Colorful umbrellas and sunbathers dot the beach. The air is filled with the distant sounds of traffic, music from open-front cafes, and seagulls.\" Weather: \"Sunny, hot, and humid with a light breeze from the ocean."
        ],
        "nestedFields": {}
    },
    "field-3": {
        "name": "weather",
        "type": "STRING",
        "presence": "DYNAMIC",
        "prompt": "Describe current weather concisely to set the scene. Example: \"Light Drizzle, Cool Outside\".",
        "defaultValue": "<Updated weather if changed>",
        "exampleValues": [
            "Overcast, mild temperature",
            "Clear skies, warm evening",
            "Sunny, gentle sea breeze"
        ],
        "nestedFields": {}
    },
    "field-4": {
        "name": "topics",
        "type": "ARRAY_OBJECT",
        "presence": "DYNAMIC",
        "prompt": "",
        "defaultValue": "",
        "exampleValues": [
            "",
            "",
            ""
        ],
        "nestedFields": {
            "field-5": {
                "name": "primarytopic",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "**One- or two-word topic** describing main activity or focus of the scene.",
                "defaultValue": "<Updated Primary Topic if changed>",
                "exampleValues": [
                    "Presentation",
                    "Workout",
                    "Relaxation"
                ],
                "nestedFields": {}
            },
            "field-6": {
                "name": "emotionaltone",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "**One- or two-word topic** describing dominant emotional atmosphere of the scene.",
                "defaultValue": "<Updated Emotional Tone if changed>",
                "exampleValues": [
                    "Tense",
                    "Focused",
                    "Calm"
                ],
                "nestedFields": {}
            },
            "field-7": {
                "name": "interactiontheme",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "**One- or two-word topic** describing primary type of interactions or relationships in the scene.",
                "defaultValue": "<Updated Interaction Theme if changed>",
                "exampleValues": [
                    "Professional",
                    "Supportive",
                    "Casual"
                ],
                "nestedFields": {}
            }
        }
    },
    "field-8": {
        "name": "characterspresent",
        "type": "ARRAY",
        "presence": "DYNAMIC",
        "prompt": "List all characters currently present in an array format.",
        "defaultValue": "<List of characters present if changed>",
        "exampleValues": [
            "[\"Emma Thompson\", \"James Miller\", \"Sophia Rodriguez\"]",
            "[\"Daniel Lee\", \"Olivia Harris\"]",
            "[\"Liam Johnson\", \"Emily Clark\"]"
        ],
        "nestedFields": {}
    },
    "field-9": {
        "name": "characters",
        "type": "FOR_EACH_OBJECT",
        "presence": "DYNAMIC",
        "prompt": "For each character, update the following details:",
        "defaultValue": "<Character Name>",
        "exampleValues": [
            "[\"Emma Thompson\", \"James Miller\", \"Sophia Rodriguez\"]",
            "[\"Daniel Lee\", \"Olivia Harris\"]",
            "[\"Liam Johnson\", \"Emily Clark\"]"
        ],
        "nestedFields": {
            "field-10": {
                "name": "hair",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "Describe style only.",
                "defaultValue": "<Updated hair description if changed>",
                "exampleValues": [
                    "Shoulder-length blonde hair, styled straight",
                    "Short brown hair, damp with sweat",
                    "Short sandy blonde hair, slightly tousled"
                ],
                "nestedFields": {}
            },
            "field-11": {
                "name": "makeup",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "Describe current makeup.",
                "defaultValue": "<Updated makeup if changed>",
                "exampleValues": [
                    "Natural look with light foundation and mascara",
                    "None",
                    "Sunscreen applied, no additional makeup"
                ],
                "nestedFields": {}
            },
            "field-12": {
                "name": "outfit",
                "type": "ARRAY",
                "presence": "DYNAMIC",
                "prompt": "List the complete outfit, including **underwear and accessories**, even if the character is undressed. If wearing swimwear, lingerie, or similar, do not list extra underwear.  Outfit stays the same until changed.",
                "defaultValue": "<Full outfit description, even if removed including color, fabric, and style details; **always include underwear and accessories if present. If underwear is intentionally missing, specify clearly**>",
                "exampleValues": [
                    "[\"Cream-colored blouse with ruffled collar\", \" Black slacks\", \" Brown leather belt\", \" Brown ankle boots\", \" Gold hoop earrings\", \" Beige satin push-up bra\", \" Beige satin bikini panties matching the bra\"]",
                    "[\"Black sports tank top\", \" Purple athletic leggings\", \" Black athletic sneakers\", \" White ankle socks\", \" Fitness tracker bracelet\", \" Black racerback sports bra\", \" Black seamless athletic bikini briefs matching the bra\"]",
                    "[\"White sundress over a red halter bikini\", \" Straw hat\", \" Brown flip-flops\", \" Gold anklet\", \" Red halter bikini top\", \" Red tie-side bikini bottoms matching the top\"]"
                ],
                "nestedFields": {}
            },
            "field-13": {
                "name": "stateofdress",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "Describe how put-together or disheveled the character appears, including any removed clothing. Note where clothing items from outfit were discarded.",
                "defaultValue": "<Current state of dress if no update is needed. Note location where discarded outfit items are placed if character is undressed>",
                "exampleValues": [
                    "Professionally dressed, attentive",
                    "Workout attire, lightly perspiring",
                    "Shirt and sandals removed, placed on beach towel"
                ],
                "nestedFields": {}
            },
            "field-14": {
                "name": "postureandinteraction",
                "type": "STRING",
                "presence": "DYNAMIC",
                "prompt": "Describe physical posture, position relative to others or objects, and interactions.",
                "defaultValue": "<Current posture and interaction if no update is needed>",
                "exampleValues": [
                    "Standing at the podium, presenting slides, holding a laser pointer",
                    "Lifting weights at the bench press, focused on form",
                    "Standing at the water's edge, feet in the surf"
                ],
                "nestedFields": {}
            },
            "field-15": {
                "name": "mood",
                "type": "STRING",
                "presence": "EPHEMERAL",
                "prompt": "Describe the current mood",
                "defaultValue": "",
                "exampleValues": [
                    "concerned",
                    "excited",
                    "slightly relieved"
                ],
                "nestedFields": {}
            },
            "field-16": {
                "name": "locationofoutfititems",
                "type": "ARRAY",
                "presence": "DYNAMIC",
                "prompt": "Analyse the current location of each outfit item, that is not worn as intended or removed. Note where clothing items from outfit were discarded. Format: [item],[wearing/removed],[location]",
                "defaultValue": "<Current state of dress if no update is needed. Note location where discarded outfit items are placed if character is undressed>",
                "exampleValues": [
                    "[\"Shirt,removed,on chair\",\"Socks,wearing,on hands\"]",
                    "[\"Shirt,removed,in closet\",\"Shoes,wearing,on hands\",\"Hat,removed,on table\"]",
                    "[\"Shoes,wearing,on hands\"]"
                ],
                "nestedFields": {}
            },
            "field-17": {
                "name": "stateofoutfititems",
                "type": "ARRAY",
                "presence": "DYNAMIC",
                "prompt": "Analyse and describe character clothing appears. \nFormat: [item],[appearance]",
                "defaultValue": "<>",
                "exampleValues": [
                    "[\"T-Shirt,dirty\",\"Socks,torn\"]",
                    "[\"Shirt,stained\",\"Shoes,wornout\",\"Hat,faded\"]",
                    "[\"Shoes,stained\"]"
                ],
                "nestedFields": {}
            }
        }
    },
    "field-18": {
        "name": "location",
        "type": "STRING",
        "presence": "DYNAMIC",
        "prompt": "Provide a **detailed and specific location**, including exact places like rooms, landmarks, or stores, following this format: \"Specific Place, Building, City, State\". Avoid unintended reuse of specific locations from previous examples. Example: \"Food court, second floor near east wing entrance, Madison Square Mall, Los Angeles, CA\".",
        "defaultValue": "<Updated location if changed>",
        "exampleValues": [
            "Conference Room B, 12th Floor, Apex Corporation, New York, NY",
            "Main Gym Hall, Maple Street Fitness Center, Denver, CO",
            "South Beach, Miami, FL"
        ],
        "nestedFields": {}
    },
    "field-19": {
        "name": "moonphase",
        "type": "STRING",
        "presence": "STATIC",
        "prompt": "Current phase of the moon",
        "defaultValue": "Full Moon",
        "exampleValues": [
            "New Moon",
            "Waxing Crescent",
            "Waning Gibbous"
        ],
        "nestedFields": {}
    }
}

// Describe the current state of each outfit item.\nFormat: [item],[state]

//"Describe how put-together or disheveled the character appears, including any removed clothing. Note where clothing items from outfit were discarded."
// // console.log("#narrator", trackerDef )
// // console.log("#narrator",helper.getDefaultTracker(trackerDef))


const exampleTracker = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    return helper.getDefaultTracker(trackerDef, 'all',"json")
}

console.log("exampleTracker",exampleTracker(), helper.getDefaultTracker(trackerDef, null, 2))

const responseRules = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    return helper.getTrackerPrompt(trackerDef)
}

const trackerExamples = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    let trackerExamples  = helper.getExampleTrackers(trackerDef,'all',"JSON")
	trackerExamples = trackerExamples.map((ex:any) => JSON.stringify(ex, null, 2));
    trackerExamples = "<START>\n<tracker>\n" + trackerExamples.join("\n</tracker>\n<END>\n<START>\n<tracker>\n") + "\n</tracker>\n<END>";
	return trackerExamples;
}

console.log("trackerExamples",trackerExamples())




const getExamples = (entry:any) => {
    if(!Array.isArray(entry.exampleValues)) return "";
    let out = "## Examples:"
    entry.exampleValues.forEach((example:any) => {
        let ex = example.trim()

        if(entry.type=="STRING"){
            ex = `"${example}"`
        }
        
        out += `\n{"data":${ex}}`
    })
     // console.log("segmentedTracker",out );
     //@ts-ignore

    return out
}






const trackerPromptMapFN = () => {
   const trackerDef = ST().extensionSettings.tracker.trackerDef    

    const recursiveFN = (objIN: any) => {
        const obj:any = {}
        _.forEach(objIN, (entry: any) => {
            // // console.log("segmentedTracker entry",entry)
            entry.name = entry.name.trim().toLowerCase()
            let out = {}
            if(_.size(entry.nestedFields) > 0){
                out = recursiveFN(entry.nestedFields)
            }else{
                const examples = getExamples(entry)
                
                out = {
                    exampleValues: examples,
                    prompt: entry.prompt,
                }
            }
            obj[entry.name] = out
        })

        // // console.log("segmentedTracker recursiveFN",obj)   
        return obj
    }

    const d = recursiveFN(trackerDef)
    // // console.log("segmentedTracker ",trackerDef , d)   
    return  d
}
     //@ts-ignore
window.test = trackerPromptMapFN()

export const trackerPromptMap = trackerPromptMapFN()







const trackerSystemPrompt = `You are a Scene Tracker Assistant, tasked with providing clear, consistent, and structured updates to a scene tracker for a roleplay. Use the latest message, previous tracker details, and context from recent messages to accurately update the tracker. Your response must follow the specified YAML structure exactly, ensuring that each field is filled and complete. If specific information is not provided, make reasonable assumptions based on prior descriptions, logical inferences, or default character details.

### Key Instructions:
1. **Tracker Format**: Always respond with a complete tracker in YAML format. Every field must be present in the response, even if unchanged. Do not omit fields or change the YAML structure.
2. **Default Assumptions for Missing Information**: 
   - **Character Details**: If no new details are provided for a character, assume reasonable defaults (e.g., hairstyle, posture, or attire based on previous entries or context).
   - **Outfit**: Describe the complete outfit for each character, using specific details for color, fabric, and style (e.g., “fitted black leather jacket with silver studs on the collar”). **Underwear must always be included in the outfit description.** If underwear is intentionally missing, specify this clearly in the description (e.g., \"No bra\", \"No panties\"). If the character is undressed, list the entire outfit.
   - **StateOfDress**: Describe how put-together or disheveled the character appears, including any removed clothing. If the character is undressed, indicate where discarded items are placed.
3. **Time Progression**: 
   - Analyze the content and complexity of the new message to estimate how much time has realistically passed.
   - Consider the type of action or dialogue: quick exchanges (few seconds), complex actions (30 seconds to minutes), scene changes (minutes to hours).
   - Format the time as \"HH:MM:SS; MM/DD/YYYY (Day Name)\".
4. **Context-Appropriate Times**: 
   - Ensure that the time aligns with the setting. For example, if the scene takes place in a public venue (e.g., a mall), maintain realistic operating hours.
5. **Location Format**: Avoid unintended reuse of specific locations from previous examples or responses. Provide specific, relevant, and detailed locations based on the context, using the format:
   - **Example**: “Food court, second floor near east wing entrance, Madison Square Mall, Los Angeles, CA” 
6. **Consistency**: Match field structures precisely, maintaining YAML syntax. If no changes occur in a field, keep the most recent value.
7. **Topics Format**: Ensure topics are one- or two-word keywords relevant to the scene to help trigger contextual information. Avoid long phrases.
8. **Avoid Redundancies**: Use only details provided or logically inferred from context. Do not introduce speculative or unnecessary information.
9. **Focus and Pause**: Treat each scene update as a standalone, complete entry. Respond with the full tracker every time, even if there are only minor updates.

### Tracker Template
Return your response in the following YAML structure, following this format precisely:

<tracker>
${exampleTracker()}
</tracker>


### Important Reminders:
1. **Last Messages and Current Tracker**: Before updating, always consider the recent messages and the provided <Current Tracker> to ensure all changes are accurately represented.
2. **Structured Response**: Do not add any extra information outside of the YAML tracker structure.
3. **Complete Entries**: Always provide the full tracker in YAML, even if only minor updates are made.

Your primary objective is to ensure clarity, consistency, and structured responses for scene tracking in YAML format, providing complete details even when specifics are not explicitly stated.`



export const generateRequestPrompt = `[Analyze the previous messages and update the current scene tracker based on logical inferences and explicit details. Pause and ensure only the tracked data is provided, formatted in {{trackerFormat}}. Avoid adding, omitting, or rearranging fields unless specified. Respond with the full tracker every time.

### Response Rules:
${responseRules()}

Ensure the response remains consistent, strictly follows this structure in {{trackerFormat}}, and omits any extra data or deviations. You MUST enclose the tracker in <tracker></tracker> tags]`;


/*
- **newscene:** Only provide a transition sentence if an action or dialogue clearly and definitively ends the current social interaction (e.g., saying goodbye and leaving, exiting a room, abruptly ending the conversation, falling asleep). Otherwise, do not output anything.
- **Time:** Analyze the content and complexity of the new message to estimate how much time has realistically passed. Consider the type of action or dialogue: quick exchanges (few seconds), complex actions (30 seconds to minutes), scene changes (minutes to hours). Use the 24-hour format: \"HH:MM:SS; MM/DD/YYYY (Day Name)\".
- **Location:** Provide a **detailed and specific location**, including exact places like rooms, landmarks, or stores, following this format: \"Specific Place, Building, City, State\". Avoid unintended reuse of specific locations from previous examples. Example: \"Food court, second floor near east wing entrance, Madison Square Mall, Los Angeles, CA\".
- **Background:** Describe only the visible, static environment as in a photograph: architecture, furniture, objects, colors, and lighting. Exclude people, actions, sounds, smells, and invisible context.
- **Weather:** Describe current weather concisely to set the scene. Example: \"Light Drizzle, Cool Outside\".
- **Topics:**
  - **PrimaryTopic:** **One- or two-word topic** describing main activity or focus of the scene.
  - **EmotionalTone:** **One- or two-word topic** describing dominant emotional atmosphere of the scene.
  - **InteractionTheme:** **One- or two-word topic** describing primary type of interactions or relationships in the scene.
- **CharactersPresent:** List all characters currently present in an array format.
- **Characters:** For each character, update the following details:
  - **Hair:** Describe style only.
  - **Makeup:** Describe current makeup.
  - **Outfit:** **IMPORTANT!** List the complete outfit, including **underwear and accessories**, even if the character is undressed. **Underwear must always be included in the outfit description. If underwear is intentionally missing, specify this clearly (e.g. \"No Bra\", \"No Panties\").** Outfit should stay the same until changed for a new one.
  - **StateOfDress:** Describe how put-together or disheveled the character appears, including any removed clothing. Note where clothing items from outfit were discarded.
  - **PostureAndInteraction:** Describe physical posture, position relative to others or objects, and interactions.

  */

export const trackerUserPromptTemplate = `
[Analyze the previous message along with the Last Message provided below and update the current scene tracker based on logical inferences and explicit details. Pause and ensure only the tracked data is provided, formatted in YAML. Avoid adding, omitting, or rearranging fields unless specified. Respond with the full tracker every time.

### Response Rules:
${responseRules()}

Ensure the response remains consistent, strictly follows this structure in YAML, and omits any extra data or deviations. You MUST enclose the tracker in <tracker></tracker> tags]`


export const trackerFullSystemPromptTemplate:any = `${trackerSystemPrompt}

<!-- Start of Context -->
Characters: "{{user}}", "{{char}}"

{{user}}: {{persona}}

{{char}}: {{description}}

scenario: {{scenario}}

### Example Trackers
<!-- Start of Example Trackers -->
${trackerExamples()}
<!-- End of Example Trackers -->

`




export const trackerSystemPromptTemplate:any = `${trackerSystemPrompt}

<!-- Start of Context -->

{{description}}

### Example Trackers
<!-- Start of Example Trackers -->
${trackerExamples()}
<!-- End of Example Trackers -->


### Current Tracker
<tracker>
{{currentTracker}}
</tracker>
<!-- End of Context -->
`


const getTrackerFieldPaths = (currentTracker?: any) => {
    if (currentTracker) {
        // Verwende den aktuellen Tracker um nur relevante Feldpfade zu extrahieren
        const extractPaths = (obj: any, prefix = ''): string[] => {
            let paths: string[] = [];
            
            for (const key in obj) {
                const currentPath = prefix ? `${prefix}.${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    // Für verschachtelte Objekte
                    paths.push(currentPath);
                    paths = paths.concat(extractPaths(obj[key], currentPath));
                } else {
                    // Für primitive Werte und Arrays
                    paths.push(currentPath);
                }
            }
            
            return paths;
        };
        
        return extractPaths(currentTracker);
    } else {
        // Fallback: Default Tracker
        const trackerDef = ST().extensionSettings.tracker.trackerDef;
        const defaultTracker = helper.getDefaultTracker(trackerDef);
        
        const extractPaths = (obj: any, prefix = ''): string[] => {
            let paths: string[] = [];
            
            for (const key in obj) {
                const currentPath = prefix ? `${prefix}.${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    paths.push(currentPath);
                    paths = paths.concat(extractPaths(obj[key], currentPath));
                } else {
                    paths.push(currentPath);
                }
            }
            
            return paths;
        };
        
        return extractPaths(defaultTracker);
    }
};


// export const trackerAnalysePrompt = `
// You are a Scene Tracker Analysis Assistant. Your task is to analyze the latest message and current tracker to identify only the specific fields that need updates.

// Analyze the latest message against the current tracker and determine which fields require changes based on:
// - New information provided in the message
// - Logical inferences from actions or dialogue
// - State changes (clothing, position, mood, etc.)

// ### Instructions:
// 1. Compare the latest message with the current tracker
// 2. Identify ONLY the fields that need to be updated (be selective - not everything changes!)
// 3. Return field paths separated by | (pipe character)
// 4. Use dot notation for nested fields
// 5. Only include fields where actual changes are needed, not fields that stay the same

// ### Available Field Paths:
// ${getTrackerFieldPaths().map(path => `- "${path}"`).join('\n')}

// ### Analysis Guidelines:
// - **Be selective**: Most messages only change 1-3 fields
// - **Location**: Only if characters moved to a different place
// - **Characters**: Only update specific attributes that actually changed
// - **Topics**: Only if the conversation topic or mood shifted
// - **Weather**: Only if explicitly mentioned or logically changed

// Latest Message: {{trackerLastMsg}}

// ### Current Tracker
// <tracker>
// {{currentTracker}}
// </tracker>

// Respond with ONLY the field paths that need updates, separated by | (pipe character). If no changes are needed, return "none".

// DO NOT add explanations, descriptions, or any other text. ONLY the field paths or "none".

// Example responses:
// characters.tim.mood|characters.lara.hair
// location
// characters.sarah.outfit|characters.sarah.stateofdress
// none
// `


// if thy add - Important for ai to follow rule
export const trackerAnalysePrompt = (currentTracker?: any) => `
Analyze the Message and identify fields that need to update based on logical inferences 
and explicit details.
Analyze the Message and identify if clothes of a characters is removed, if thy add "characters.<name>.undressing".

State before Message: {{currentTracker}}

Message: "{{trackerLastMsg}}"

Changed fields?

Format: {"data":["path1","path2"]}

Examples: 
{"data":["characters.john.feet","location"]}
{"data":[]}

Respond with a valid JSON Object only.
Omit any explanation, or codeblocks.
`

// Analyze the Message and identify if clothes of a characters is removed , if thy add "characters.<name>.undressing".

//Explain your decision for the outfit change ,in max. 3 sentences
// Respond with a valid JSON Object only
// Pick from: ${getTrackerFieldPaths(currentTracker).join('|')}

// Important: "characters.Lara.outfit" change: undress = false, dress = yes.

export const singleStepPrompt = `
Analyze the previous messages and execute the prompt based on logical inferences and explicit details. 
Do not include a reason in your answer. Only descripe the current state. Omit ongoing actions.
Note: If the message indicates no change then output the "State before Message"

Characters present: {{fieldCharacterspresent}}
Key:{{fieldkey}}
{{fieldExtraContext}}
State before Message: {{currentValue}}

Message: "{{trackerLastMsg}}"

Prompt: {{fieldPrompt}}

{{fieldExamples}}

Respond only with the format in the Examples.
Respond with a valid JSON Object only
`
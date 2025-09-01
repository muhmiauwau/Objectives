import * as _ from 'lodash-es';

import ST from 'data/SillyTavern';

// @ts-ignore 
const helper:any = window.Objectives ;

const trackerDef = ST().extensionSettings.tracker.trackerDef
console.log("#narrator", trackerDef )
console.log("#narrator",helper.getDefaultTracker(trackerDef))


const exampleTracker = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    return helper.jsonToYAML(helper.getDefaultTracker(trackerDef))
}

const responseRules = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    return helper.getTrackerPrompt(trackerDef)
}

const trackerExamples = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef
    let trackerExamples  = helper.getExampleTrackers(trackerDef,'all',"yaml")
    trackerExamples = "<START>\n<tracker>\n" + trackerExamples.join("\n</tracker>\n<END>\n<START>\n<tracker>\n") + "\n</tracker>\n<END>";
	return trackerExamples;
}

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
${responseRules}

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


const getTrackerFieldPaths = () => {
    const trackerDef = ST().extensionSettings.tracker.trackerDef;
    const defaultTracker = helper.getDefaultTracker(trackerDef);
    
    // Rekursive Funktion um alle Feldpfade zu extrahieren
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
    
    return extractPaths(defaultTracker);
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

export const trackerAnalysePrompt = `
You are a Scene Tracker Analysis Assistant. Your task is to analyze the latest message and current tracker to identify only the specific fields that need updates.

Analyze the latest message against the current tracker and determine which fields require changes based on:
- New information provided in the message
- Logical inferences from actions or dialogue
- State changes (clothing, position, mood, etc.)

### Instructions:
1. Compare the latest message with the current tracker
2. Identify ONLY the fields that need to be updated (be selective - not everything changes!)
3. Return field paths separated by | (pipe character)
4. Use dot notation for nested fields
5. Only include fields where actual changes are needed, not fields that stay the same

### Available Field Paths:
${getTrackerFieldPaths().map(path => `- "${path}"`).join('\n')}

### Analysis Guidelines:
- **Be selective**: Most messages only change 1-3 fields
- **Location**: Only if characters moved to a different place
- **Characters**: Only update specific attributes that actually changed
- **Topics**: Only if the conversation topic or mood shifted
- **Weather**: Only if explicitly mentioned or logically changed

Latest Message: {{trackerLastMsg}}

### Current Tracker
<tracker>
{{currentTracker}}
</tracker>

Respond with ONLY the field paths that need updates, separated by | (pipe character). If no changes are needed, return "none".

DO NOT add explanations, descriptions, or any other text. ONLY the field paths or "none".

Example responses:
characters.tim.mood|characters.lara.hair
location
characters.sarah.outfit|characters.sarah.stateofdress
none
`
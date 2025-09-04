export const trackerDef = {
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
                "prompt": `Analyse the current state of each outfit item, that is not worn as intended or removed. Note where clothing items from outfit were discarded. Format: [item],[wearing/removed],[location]`,
                "defaultValue": "Descripe each outfit item that is not worn as intended or removed?",
                "changeDetection": "outfit item: not worn as intended or removed?",
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
                "prompt": `Analyse the message and list all outfit items how they look. Make sure you list all items from "outfit". Format: [item],[]`,
                "defaultValue": `<Analyse the message and list all outfit items how they look. Make sure you list all items from "outfit".`,
                "changeDetection": "the physical state or condition of clothing items, excluding removal or disappearance.",
                "exampleValues": [
                    "[\"T-Shirt,clean\",\"Shorts,dirty\"]",
                    "[\"Shirt,stained\",\"Socks,torn\"]",
                    "[\"Hat,faded\"]"
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
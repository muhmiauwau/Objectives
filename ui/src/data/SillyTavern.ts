// // @ts-ignore
// let context = window?.SillyTavern?.getContext() || {}
// console.log("context", context.chatMetadata)
// import * as _ from 'lodash-es';


// const newContext: Record<string, any> = {};

// _.forEach(context, (value, key) => {
//   Object.defineProperty(newContext, key, {
//     get() {
//          // @ts-ignore
//         let data = window?.SillyTavern?.getContext?.()[key]
//  console.log("ddddd dds ", key);
//         if("characterId" == key){
//             console.log("ddddd ddddd ", data);
//             data = {data}

//         }
//         // @ts-ignore
//       return data;


//     },
//     set(value: any) {
//       // optional
//     },
//     enumerable: true,
//     configurable: true
//   });
// });

//   console.log("ddd",newContext)

// export const  { 
//     accountStorage,
//     chat,
//     characters,
//     groups,
//     name1,
//     name2,
//     characterId,
//     groupId,
//     chatId,
//     getCurrentChatId,
//     getRequestHeaders,
//     reloadCurrentChat,
//     renameChat,
//     saveSettingsDebounced,
//     onlineStatus,
//     maxContext,
//     chatMetadata,
//     streamingProcessor,
//     eventSource,
//     eventTypes,
//     addOneMessage,
//     deleteLastMessage,
//     generate,
//     sendStreamingRequest,
//     sendGenerationRequest,
//     stopGeneration,
//     tokenizers,
//     getTextTokens,
//     getTokenCount,
//     getTokenCountAsync,
//     extensionPrompts,
//     setExtensionPrompt,
//     updateChatMetadata,
//     saveChat,
//     openCharacterChat,
//     openGroupChat,
//     saveMetadata,
//     sendSystemMessage,
//     activateSendButtons,
//     deactivateSendButtons,
//     saveReply,
//     substituteParams,
//     substituteParamsExtended,
//     SlashCommandParser,
//     SlashCommand,
//     SlashCommandArgument,
//     SlashCommandNamedArgument,
//     ARGUMENT_TYPE,
//     executeSlashCommandsWithOptions,
//     registerSlashCommand,
//     executeSlashCommands,
//     timestampToMoment,
//     registerHelper,
//     registerMacro,
//     unregisterMacro,
//     registerFunctionTool,
//     unregisterFunctionTool,
//     isToolCallingSupported,
//     canPerformToolCalls,
//     ToolManager,
//     registerDebugFunction,
//     renderExtensionTemplate,
//     renderExtensionTemplateAsync,
//     registerDataBankScraper,
//     callPopup,
//     callGenericPopup,
//     showLoader,
//     hideLoader,
//     mainApi,
//     extensionSettings,
//     ModuleWorkerWrapper,
//     getTokenizerModel,
//     generateQuietPrompt,
//     generateRaw,
//     writeExtensionField,
//     getThumbnailUrl,
//     selectCharacterById,
//     messageFormatting,
//     shouldSendOnEnter,
//     isMobile,
//     t,
//     translate,
//     getCurrentLocale,
//     addLocaleData,
//     tags,
//     tagMap,
//     menuType,
//     createCharacterData,
//     event_types,
//     Popup,
//     POPUP_TYPE,
//     POPUP_RESULT,
//     chatCompletionSettings,
//     textCompletionSettings,
//     powerUserSettings,
//     getCharacters,
//     getCharacterCardFields,
//     uuidv4,
//     humanizedDateTime,
//     updateMessageBlock,
//     appendMediaToMessage,
//     swipe,
//     variables,
//     loadWorldInfo,
//     saveWorldInfo,
//     reloadWorldInfoEditor,
//     updateWorldInfoList,
//     convertCharacterBook,
//     getWorldInfoPrompt,
//     CONNECT_API_MAP,
//     getTextGenServer,
//     extractMessageFromData,
//     getPresetManager,
//     getChatCompletionModel,
//     printMessages,
//     clearChat,
//     ChatCompletionService,
//     TextCompletionService,
//     ConnectionManagerRequestService,
//     updateReasoningUI,
//     parseReasoningFromString,
//     unshallowCharacter,
//     unshallowGroupMembers,
//     symbols
// } = newContext;


// @ts-ignore
export default window?.SillyTavern?.getContext

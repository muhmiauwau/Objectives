import { init } from "./src/init.js";
import { extension_settings } from "/scripts/extensions.js";
import { log, warn, debug, error, unescapeJsonString } from "./lib/utils.js";
import { yamlToJSON, jsonToYAML } from "./lib/ymlParser.js";
import {
  getDefaultTracker,
  getTrackerPrompt,
  getExampleTrackers,
  getChangedTracker
} from "./trackerDataHandler.js";

export const extensionName = "Objectives";
const extensionNameLong = `Objectives`;
export const extensionFolderPath = `scripts/extensions/third-party/${extensionNameLong}`;
export const extensionSettings = extension_settings[extensionName] | {};


window.Objectives = {
  log,
  warn,
  debug,
  error,
  unescapeJsonString,
  yamlToJSON,
  jsonToYAML,
  getDefaultTracker,
  getTrackerPrompt,
  getExampleTrackers,
  getChangedTracker
};

let angularLoaded = false;

function loadAngular() {
  if (angularLoaded) return;
   const bsscript = document.createElement("script");
  bsscript.src = "http://localhost:35729/livereload.js";
   document.head.appendChild(bsscript);
  console.log("loadAngular");
  // $("#movingDivs").append(
  //   '<objectives-panel class="fillLeft muhPanel drawer-content  open"></objectives-panel>'
  // );
  // $("#extensions_settings").append(
  //   '<objectives-settings class="expression_settings"></objectives-settings>'
  // );
  $("#movingDivs").append(
    '<objectives-tracker-panel class="fillRight muhPanel muhPanel-current-tracker drawer-content  open"></objectives-tracker-panel>'
  );

  const script = document.createElement("script");
  script.src = extensionFolderPath + "/ui/dist/ui/browser/main.js";
  document.head.appendChild(script);
  angularLoaded = true;
}

jQuery(() => {
    
  loadAngular()

  let bla = setInterval(() => {
    if ($(".welcomePanel").length > 0) {
      clearInterval(bla);
      bla = null;
      $(".recentChat:first-child").click();
    }
  }, 100);

  setTimeout(() => {
    if (bla) {
      clearInterval(bla);
      // loadAngular()
    }
  }, 5000);
})

SillyTavern.getContext().registerMacro("tracker", function () {
  if (!window.currentTracker) {
    const id = $("objectives-narrator-msg")
      .last()
      .parents(".mes.smallSysMes")
      .attr("mesid");
    if (!id) return;
    const tracker = SillyTavern.getContext().chat[id].tracker;
    if (!tracker) return;
    window.currentTracker = tracker;
  }


  // stateofdress
  //@ts-ignore
  let tracker = jsonToYAML(window.currentTracker);
  return `\n\n<Tracker>${tracker}</Tracker>\n\n \n\n  Wichtig:Diese "<Tracker>" Informationen sind nur für deinen context, inkludiere die niemals in deine Antwort`;
});

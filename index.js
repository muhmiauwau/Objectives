
import { init } from './src/init.js';

let angularLoaded  = false

function loadAngular(){
    if(angularLoaded) return;
     console.log('loadAngular');
    $('#movingDivs').append('<objectives-panel class="fillLeft muhPanel drawer-content  open"></objectives-panel>');
    $('#extensions_settings').append('<objectives-settings class="expression_settings"></objectives-settings>');
    const script = document.createElement('script');
    script.src = 'scripts/extensions/third-party/Objectives/ui/dist/ui/browser/main.js';
    document.head.appendChild(script);
    angularLoaded = true
}


jQuery(() => {
    
    // $(".recentChat:first-child").click()
    // loadAngular()

     let bla = setInterval(() => { 
        if($(".welcomePanel").length > 0){
            clearInterval(bla)
            bla = null;
          $(".recentChat:first-child").click()
        }
    }, 100);

     setTimeout(() => {
        if (bla) {
            clearInterval(bla) 
            // loadAngular()
        }
    }, 5000)
        
});
// jQuery(init());


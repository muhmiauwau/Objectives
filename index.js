
import { init } from './src/init.js';




function loadAngular(){
     console.log('loadAngular');
    $('#movingDivs').append('<objectives-panel class="fillLeft muhPanel drawer-content  open"></objectives-panel>');
    const script = document.createElement('script');
    script.src = 'scripts/extensions/third-party/Objectives/ui/dist/ui/browser/main.js';
    document.head.appendChild(script);
}


jQuery(() => {


     let bla = setInterval(() => { 
        if($(".welcomePanel").length > 0){
            clearInterval(bla)
            bla = null;
            $(".recentChat:first-child").click()
            loadAngular()
        }
    }, 100);

        

    setTimeout(() => {
        if (bla) {
            clearInterval(bla) 
            loadAngular()
        }
    }, 5000)


    
    // console.log('jQuery gesichert:', typeof original$);
    // $('#movingDivs').append('<objectives-panel></objectives-panel>');
    //   setTimeout(() => {
            
    //         // Script dynamisch laden
    //         const script = document.createElement('script');
    //         script.src = 'scripts/extensions/third-party/Objectives/ui/dist/ui/browser/main.js';
    //         script.onload = () => {
    //             console.log('Angular geladen - jQuery überschrieben:', typeof window.$);
                
    //                 // jQuery WIEDERHERSTELLEN
    //                 window.jQuery = originalJQuery;
    //                 window.$ = originalJQuery;
                    
                    
    //                 console.log('jQuery wiederhergestellt:', typeof window.$);
                    
    //                 // Jetzt Custom Element einbinden
    //                 // $('#movingDivs').append('<objectives-panel></objectives-panel>');
    //                 console.log('objectives-panel eingefügt');
    //         };
    //         document.head.appendChild(script);

   
    //     }, 1200)
});
// jQuery(init());



import { init } from './src/init.js';

jQuery(() => {
    // jQuery SICHERN bevor Angular es überschreibt
    const originalJQuery = window.jQuery;
    const original$ = $;
    
    console.log('jQuery gesichert:', typeof original$);
    $('#movingDivs').append('<objectives-panel></objectives-panel>');
      setTimeout(() => {
            
            // Script dynamisch laden
            const script = document.createElement('script');
            script.src = 'scripts/extensions/third-party/Objectives/ui/dist/ui/browser/main.js';
            script.onload = () => {
                console.log('Angular geladen - jQuery überschrieben:', typeof window.$);
                
                    // jQuery WIEDERHERSTELLEN
                    window.jQuery = originalJQuery;
                    window.$ = originalJQuery;
                    
                    
                    console.log('jQuery wiederhergestellt:', typeof window.$);
                    
                    // Jetzt Custom Element einbinden
                    // $('#movingDivs').append('<objectives-panel></objectives-panel>');
                    console.log('objectives-panel eingefügt');
            };
            document.head.appendChild(script);

   
        }, 1200)
});
// jQuery(init());


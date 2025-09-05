import { createApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { createCustomElement } from '@angular/elements';
// import { Panel } from 'panel/panel';
// import { Settings } from 'settings/settings';
// import { NarratorMsg } from 'narrator-msg/narrator-msg';
// import { CurrentTracker } from 'current-tracker/current-tracker';
import { TrackerElement } from 'app/modules/tracker/element';
import { TrackerMesTracker } from 'app/modules/tracker/components/mes-tracker/mes-tracker';
// Zoneless Custom Elements Setup
createApplication({
  providers: [
    provideZonelessChangeDetection(),
    { provide: PLATFORM_ID, useValue: 'browser' }
  ]
}).then((appRef) => {
  console.log('✅ Angular Application created successfully');
  
  try {
    // Custom Elements erstellen
    // const panelElement = createCustomElement(Panel, { injector: appRef.injector });
    // const settingsElement = createCustomElement(Settings, { injector: appRef.injector });
    // const narratorMsgElement = createCustomElement(NarratorMsg, { injector: appRef.injector });
    // const currentTracker = createCustomElement(CurrentTracker, { injector: appRef.injector });

    const trackerElement = createCustomElement(TrackerElement, { injector: appRef.injector });
    const trackerMesTracker = createCustomElement(TrackerMesTracker, { injector: appRef.injector });


    // Custom Elements registrieren
    // customElements.define('objectives-panel', panelElement);
    // customElements.define('objectives-settings', settingsElement);
    // customElements.define('objectives-narrator-msg', narratorMsgElement);
    // customElements.define('objectives-current-tracker', currentTracker);
    customElements.define('objectives-tracker-panel', trackerElement);
    customElements.define('objectives-tracker-mes-tracker', trackerMesTracker);

  } catch (error) {
    console.error('❌ Failed to create custom elements:', error);
  }
}).catch((err) => {
  console.error('❌ Angular application failed:', err);
});

import { createApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { Panel } from 'panel/panel';
import { Settings } from 'settings/settings';
import { NarratorMsg } from 'narrator-msg/narrator-msg';
import { CurrentTracker } from 'current-tracker/current-tracker';


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
    const panelElement = createCustomElement(Panel, { injector: appRef.injector });
    const settingsElement = createCustomElement(Settings, { injector: appRef.injector });
    const narratorMsgElement = createCustomElement(NarratorMsg, { injector: appRef.injector });
    const currentTracker = createCustomElement(CurrentTracker, { injector: appRef.injector });

    // Custom Elements registrieren
    customElements.define('objectives-panel', panelElement);
    customElements.define('objectives-settings', settingsElement);
    customElements.define('objectives-narrator-msg', narratorMsgElement);
    customElements.define('objectives-current-tracker', currentTracker);
// @ts-ignore
    console.log('✅ Custom Elements registered: objectives-panel, objectives-settings');
  } catch (error) {
    console.error('❌ Failed to create custom elements:', error);
  }
}).catch((err) => {
  console.error('❌ Angular application failed:', err);
});

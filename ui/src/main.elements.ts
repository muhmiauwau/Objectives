import { createApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { Panel } from './app/panel/panel';
import { Settings } from './app/settings/settings';

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

    // Custom Elements registrieren
    customElements.define('objectives-panel', panelElement);
    customElements.define('objectives-settings', settingsElement);
// @ts-ignore
    console.log('✅ Custom Elements registered: objectives-panel, objectives-settings -' ,window.$);;
  } catch (error) {
    console.error('❌ Failed to create custom elements:', error);
  }
}).catch((err) => {
  console.error('❌ Angular application failed:', err);
});

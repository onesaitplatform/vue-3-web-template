import {
  Server,
  BIMViewer,
  LocaleService,
} from "https://territorios-clm-dev.onesaitplatform.com/web/xeokit-bim-viewer_251_beta32/xeokit-bim-viewer/xeokit-bim-viewer.min.es.js";

window.server = Server;
window.bimViewer = BIMViewer;
window.localeService = LocaleService;

import { messages } from "https://territorios-clm-dev.onesaitplatform.com/web/xeokit-bim-viewer_251_beta32/xeokit-bim-viewer/messages.js";
window.localeMessages = messages;

import { AnnotationsPlugin } from "https://territorios-clm-dev.onesaitplatform.com/web/xeokit-bim-viewer_251_beta32/xeokit-sdk/xeokit-sdk.min.es.js";
window.annotationsPlugin = AnnotationsPlugin;

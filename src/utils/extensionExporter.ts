import JSZip from 'jszip';
import { EXTENSION_FILES } from '../extensionSource/files';

// Valid 32x32 PNG base64 representation for Chrome Extension Icons
const ICON_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACNSURBVFhH7ZYxDsAgDAM5e/9D+YBCRylS24mJmS1is44pAtXagS3pXk33ap7E34vE+eI3C2ABx3A2ADawDxE8G3ACeIADXAK+fA6wAJ5A8GzACeABDrAJ+PI5wAIs4BjOBsAG/iGCZwNOAA9wgE3Al88BFmABx3A2ADbwDxE8G3ACeIADbAK+3B821AL1uSAn4AAAAABJRU5ErkJggg==';

export async function downloadExtensionZip() {
  const zip = new JSZip();

  // Add all source files
  EXTENSION_FILES.forEach((file) => {
    zip.file(file.name, file.content);
  });

  // Create icons folder with valid PNG icon files
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    iconsFolder.file('icon16.png', ICON_BASE64, { base64: true });
    iconsFolder.file('icon48.png', ICON_BASE64, { base64: true });
    iconsFolder.file('icon128.png', ICON_BASE64, { base64: true });
  }

  zip.file(
    'README.txt',
    `Pocket Option AI Trading Assistant Pro Chrome Extension v3.2.0 (Latest Pro Build)\n` +
      `Updated: ${new Date().toLocaleString()}\n\n` +
      `What's Fixed & Updated in v3.2.0:\n` +
      `- Fixed PO AI Overlay auto-display across ALL Pocket Option domains & mirrors (po.trade, po8.trade, po2.trade, po.broker, po1..99.capital, pocketoption.com, /cabinet/*)\n` +
      `- Instant injection into already-open Pocket Option tabs upon installation + "SHOW PO AI OVERLAY ON TAB" 1-click button inside Popup\n` +
      `- Eliminated all Chrome Extension runtime.lastError & service worker errors\n` +
      `- Updated transparent empty L-Shape Chart Scanner ("SCANNING 10/2 CANDLES" + smooth up-and-down wave)\n` +
      `- Default Dark Mode with optional Warm Brown Light Mode switcher\n\n` +
      `Installation / Update Steps:\n` +
      `1. Unzip this package folder.\n` +
      `2. Open Google Chrome and go to chrome://extensions\n` +
      `3. Enable "Developer mode" (toggle switch in the top right corner).\n` +
      `4. Remove any older version of the extension first.\n` +
      `5. Click "Load unpacked" -> Select this unzipped folder.\n` +
      `6. Open Pocket Option (or click the Extension icon -> "SHOW PO AI OVERLAY ON TAB") to display the PO AI Overlay & L-Shape 10/2 Scanner immediately!`
  );

  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger download with date tag to ensure fresh download
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = Date.now().toString().slice(-4);
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pocket-option-ai-extension-v3.2.0-PRO-LATEST-${dateStr}-${timeStr}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


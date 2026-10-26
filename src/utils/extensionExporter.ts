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
    iconsFolder.file(
      'README.txt',
      `Pocket Option AI Trading Assistant Pro Chrome Extension v3.2.0 (Latest Pro Build)\n` +
      `Updated: ${new Date().toLocaleString()}\n\n` +
      `What's New in v3.2.0:\n` +
      `- Updated transparent empty L-Shape Chart Scanner ("SCANNING 10/2 CANDLES" + smooth up-and-down wave)\n` +
      `- Synced Pocket Option PO AI Overlay & Extension Popup with latest UI updates\n` +
      `- Default Dark Mode with optional Warm Brown Light Mode switcher\n` +
      `- Removed Live Balance clutter across Extension & PO Overlay\n\n` +
      `Installation / Update Steps:\n` +
      `1. Unzip this package folder.\n` +
      `2. Open Google Chrome and go to chrome://extensions\n` +
      `3. Enable "Developer mode" (toggle switch in the top right corner).\n` +
      `4. If you had an older version installed, click "Remove" first.\n` +
      `5. Click "Load unpacked" -> Select this unzipped folder.\n` +
      `6. Open or refresh Pocket Option (https://po.trade or https://pocketoption.com) to see the updated PO Overlay & L-Shape 10/2 Scanner!`
    );
  }

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


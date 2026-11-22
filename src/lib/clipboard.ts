/**
 * Safely copy text to clipboard across all browser environments
 * including non-HTTPS, local IPs, iframes, and mobile devices.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern Navigator Clipboard API if available and in secure context
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // 2. Fallback to textarea + document.execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.contain = 'strict';
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.fontSize = '12pt'; // Prevent iOS zoom

    const selection = document.getSelection();
    let originalRange: Range | boolean = false;
    if (selection && selection.rangeCount > 0) {
      originalRange = selection.getRangeAt(0);
    }

    document.body.appendChild(textArea);
    textArea.select();
    textArea.selectionStart = 0;
    textArea.selectionEnd = text.length;

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }

    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

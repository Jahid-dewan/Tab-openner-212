/**
 * Core multi-tab opening engine and Chrome compatibility utilities
 */

export interface OpenTabResult {
  success: boolean;
  blocked: boolean;
}

/**
 * Attempts to open a single tab and inspects if Chrome blocked it.
 */
export function openSingleTab(url: string): OpenTabResult {
  try {
    // Calling window.open with _blank
    const win = window.open(url, '_blank');

    // If window.open returns null or undefined, Chrome pop-up blocker intercepted it
    if (!win) {
      return { success: false, blocked: true };
    }

    // Sometimes Chrome returns a mock window that is instantly closed or has no focus ability
    if (typeof win.closed !== 'undefined' && win.closed) {
      return { success: false, blocked: true };
    }

    return { success: true, blocked: false };
  } catch {
    return { success: false, blocked: true };
  }
}

/**
 * Tests whether Chrome / current browser allows pop-ups right now.
 * Opens a tiny window and immediately closes it.
 */
export function testPopupPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const testWin = window.open('about:blank', '_blank', 'width=1,height=1,left=-1000,top=-1000');
      if (!testWin || testWin.closed || typeof testWin.closed === 'undefined') {
        resolve(false);
      } else {
        testWin.close();
        resolve(true);
      }
    } catch {
      resolve(false);
    }
  });
}

/**
 * Generates a self-contained offline HTML file that opens all N tabs directly.
 * Useful if the user wants to launch outside an iframe or keep an opener shortcut.
 */
export function generateStandaloneOpenerHtml(url: string, count: number, staggerMs: number = 5000): string {
  const safeCount = Math.min(Math.max(1, count), 60);
  const escapedUrl = JSON.stringify(url);
  const delayInSeconds = (staggerMs / 1000).toFixed(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TabLaunch X - Opening ${safeCount} Tabs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #f4f4f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1 { font-size: 20px; margin-bottom: 8px; color: #fff; }
    p { color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 24px; }
    .badge {
      display: inline-block;
      font-size: 12px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 6px;
      padding: 4px 10px;
      margin-bottom: 16px;
      font-family: monospace;
    }
    .progress-bar-bg {
      background: #27272a;
      border-radius: 8px;
      height: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .progress-bar {
      background: #0284c7;
      height: 100%;
      width: 0%;
      transition: width 0.1s ease;
    }
    .btn {
      background: #0284c7;
      color: white;
      border: none;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.15s;
    }
    .btn:hover { background: #0369a1; }
    .btn-secondary {
      background: #27272a;
      color: #e4e4e7;
      margin-left: 8px;
      font-size: 13px;
      padding: 12px 18px;
    }
    .btn-secondary:hover { background: #3f3f46; }
    .status { font-family: monospace; font-size: 13px; color: #38bdf8; margin-top: 16px; }
    .countdown {
      font-family: monospace;
      font-size: 14px;
      color: #fbbf24;
      margin-top: 12px;
      font-weight: bold;
    }
    .warning {
      background: rgba(234, 179, 8, 0.1);
      border: 1px solid rgba(234, 179, 8, 0.3);
      color: #fef08a;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
      margin-top: 20px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Opening ${safeCount} Twitter Tabs</h1>
    <p>Target: <span style="color:#e4e4e7; word-break:break-all;">${url}</span></p>

    <div class="badge">⏱️ Delay: ${delayInSeconds}s between each tab</div>

    <div class="progress-bar-bg">
      <div id="bar" class="progress-bar"></div>
    </div>

    <div>
      <button id="startBtn" class="btn" onclick="startOpening()">Launch All ${safeCount} Tabs</button>
      <button id="skipBtn" class="btn btn-secondary" style="display:none;" onclick="skipWait()">Skip Delay & Open Now</button>
    </div>

    <div id="countdown" class="countdown"></div>
    <div id="status" class="status">Waiting to start...</div>

    <div class="warning">
      <strong>⚠️ Chrome Pop-up Notice:</strong> If Chrome opens only 1 tab and stops, click the 🚫 pop-up icon in the top address bar, choose <em>"Always allow pop-ups"</em>, and press Launch again.
    </div>
  </div>

  <script>
    const targetUrl = ${escapedUrl};
    const totalTabs = ${safeCount};
    const delayMs = ${staggerMs};
    let current = 0;
    let blockedCount = 0;
    let timerId = null;
    let remainingMs = 0;

    function startOpening() {
      document.getElementById('startBtn').disabled = true;
      document.getElementById('startBtn').style.opacity = '0.5';
      current = 0;
      blockedCount = 0;
      openCurrentTab();
    }

    function openCurrentTab() {
      if (current >= totalTabs) {
        document.getElementById('countdown').innerText = '';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('status').innerText = 'Completed! ' + (totalTabs - blockedCount) + ' tabs opened' + (blockedCount > 0 ? ' (' + blockedCount + ' blocked)' : '');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').style.opacity = '1';
        document.getElementById('startBtn').innerText = 'Launch Again';
        return;
      }

      current++;
      const win = window.open(targetUrl, '_blank');
      if (!win || win.closed) {
        blockedCount++;
      }

      const percent = Math.round((current / totalTabs) * 100);
      document.getElementById('bar').style.width = percent + '%';
      document.getElementById('status').innerText = 'Tab ' + current + ' of ' + totalTabs + ' opened.';

      if (current < totalTabs && delayMs > 0) {
        document.getElementById('skipBtn').style.display = 'inline-block';
        startCountdown(delayMs);
      } else if (current < totalTabs) {
        openCurrentTab();
      } else {
        openCurrentTab(); // Trigger complete
      }
    }

    function startCountdown(ms) {
      remainingMs = ms;
      updateCountdownText();
      clearInterval(timerId);
      timerId = setInterval(() => {
        remainingMs -= 100;
        if (remainingMs <= 0) {
          clearInterval(timerId);
          document.getElementById('countdown').innerText = '';
          document.getElementById('skipBtn').style.display = 'none';
          openCurrentTab();
        } else {
          updateCountdownText();
        }
      }, 100);
    }

    function updateCountdownText() {
      document.getElementById('countdown').innerText = '⏱️ Opening Tab ' + (current + 1) + ' in ' + (remainingMs / 1000).toFixed(1) + 's...';
    }

    function skipWait() {
      clearInterval(timerId);
      document.getElementById('countdown').innerText = '';
      document.getElementById('skipBtn').style.display = 'none';
      openCurrentTab();
    }
  </script>
</body>
</html>`;
}

/**
 * Downloads a string as an HTML file in the user's browser.
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/html') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates terminal commands to launch N tabs directly in Chrome on macOS, Windows, or Linux.
 */
export function generateChromeCommand(url: string, count: number, os: 'windows' | 'mac' | 'linux'): string {
  const safeCount = Math.min(Math.max(1, count), 60);
  const urls = Array(safeCount).fill(`"${url}"`).join(' ');

  switch (os) {
    case 'windows':
      return `start chrome ${urls}`;
    case 'mac':
      return `open -na "Google Chrome" --args ${urls}`;
    case 'linux':
      return `google-chrome ${urls}`;
  }
}

/**
 * installFontsWindows.js
 *
 * On Windows, node-canvas's registerFont uses AddFontResourceEx(FR_PRIVATE)
 * to load fonts, but Pango's Win32 backend cannot discover FR_PRIVATE fonts.
 * This results in the error:
 *   "couldn't load font 'Roboto ...', falling back to 'Sans ...'"
 *
 * The fix is to install fonts at the **user level** — the same thing Windows
 * does when you right-click a font → "Install".  This copies fonts to
 *   %LOCALAPPDATA%\Microsoft\Windows\Fonts\
 * and adds registry entries under
 *   HKCU\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts
 *
 * This does NOT require admin privileges.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Install all .ttf files from `fontsDir` into the current Windows user's
 * font directory so that Pango (and all GDI consumers) can see them.
 *
 * Skips files that are already installed (same size).
 *
 * @param {string} fontsDir  Absolute path to directory containing .ttf files
 */
export function installFontsForCurrentUser(fontsDir) {
  if (process.platform !== 'win32') {
    // Nothing to do on macOS / Linux — registerFont works fine there
    return;
  }

  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) {
    console.warn('⚠ LOCALAPPDATA not set — cannot install user-level fonts');
    return;
  }

  const userFontsDir = path.join(localAppData, 'Microsoft', 'Windows', 'Fonts');

  // Create the user fonts directory if it doesn't exist
  if (!fs.existsSync(userFontsDir)) {
    fs.mkdirSync(userFontsDir, { recursive: true });
  }

  const ttfFiles = fs.readdirSync(fontsDir).filter(f => f.toLowerCase().endsWith('.ttf'));
  const ps1Lines = [];
  let copiedCount = 0;

  for (const file of ttfFiles) {
    const srcPath = path.join(fontsDir, file);
    const destPath = path.join(userFontsDir, file);

    let needsCopy = true;
    if (fs.existsSync(destPath)) {
      const srcStat = fs.statSync(srcPath);
      const destStat = fs.statSync(destPath);
      if (srcStat.size === destStat.size) {
        needsCopy = false;
      }
    }

    if (needsCopy) {
      try {
        fs.copyFileSync(srcPath, destPath);
        copiedCount++;
      } catch (copyErr) {
        console.warn(`  ⚠ Could not copy font file ${file}:`, copyErr.message);
      }
    }

    // Always prepare registry command for all fonts to guarantee registry alignment!
    const displayName = file.replace(/\.ttf$/i, '') + ' (TrueType)';
    // In PowerShell .ps1 file, single quotes are literal, so we only need to double the single quotes in the font name.
    const escapedName = displayName.replace(/'/g, "''");
    // Standard backslashes in paths are literal inside single-quoted strings, no need to double them.
    ps1Lines.push(`New-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts' -Name '${escapedName}' -Value '${destPath}' -PropertyType String -Force | Out-Null`);
  }

  

  // Add WM_FONTCHANGE broadcast block using a C# P/Invoke compilation
  ps1Lines.push(`
$code = @"
using System;
using System.Runtime.InteropServices;
public class Win32Font {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SendNotifyMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
"@
Add-Type -TypeDefinition $code
[Win32Font]::SendNotifyMessage([IntPtr]0xFFFF, 0x001D, [IntPtr]::Zero, [IntPtr]::Zero)
`);

  const ps1Content = ps1Lines.join('\r\n');
  const tempDir = path.join(path.dirname(fontsDir), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const ps1Path = path.join(tempDir, 'install_fonts.ps1');

  try {
    fs.writeFileSync(ps1Path, ps1Content, 'utf8');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1Path}"`, {
      windowsHide: true,
      timeout: 25000,
    });
    
  } catch (err) {
    
  } finally {
    try {
      if (fs.existsSync(ps1Path)) {
        fs.unlinkSync(ps1Path);
      }
    } catch (e) {}
  }
}

## Setup

Requires Alfred 5 with Powerpack and the Qobuz macOS desktop app. Import the `.alfredworkflow` file from Releases. Enable Alfred in System Settings → Privacy & Security → Accessibility, and allow its requests to control System Events and Qobuz under Automation. Open Qobuz, sign in and load a playable queue. Close dialogs before sending commands.

## Usage

Control Qobuz playback and volume via the `qobuz` keyword.

| Keyword | Action |
| --- | --- |
| `qplay` | Toggle play/pause |
| `qnext` | Next track |
| `qprev` | Previous track / restart according to Qobuz |
| `qup` / `qdown` | Qobuz software volume +5 / −5 |
| `qsearch Miles Davis` | Search in the desktop app |
| `qcheck` | Check Accessibility availability |
| `qdebug` | Open the latest local diagnostic log |

Playback and volume briefly bring Qobuz forward, send its own shortcut and restore the previously active app. Qobuz may visibly flash. Search and Open leave it visible. If you switch to another app during a command, restoration does not override that switch. Keywords are editable in Alfred's workflow editor.

## Limitations

This uses macOS System Events UI scripting and Qobuz's keyboard shortcuts, not a Qobuz remote-control API, app-specific AppleScript transport commands, or generic media-key broadcasts. It requires an unlocked desktop session. UI changes, dialogs, keyboard layouts and focus timing can interfere. Search text entry may vary with non-Latin characters. Fixed-volume or remote output devices may ignore software volume. Separate deterministic play and pause are not provided.

Next-track playback and focus restoration were confirmed on one user's Mac using v1.1.2; other commands and broader compatibility still need community testing. Qobuz's installed shortcut panel and handlers were inspected in desktop version 8.3.0-b028 (UI 8.3.0-b029). A “Sent” message confirms shortcut dispatch, not an independently verified playback change.

## Troubleshooting and privacy

If a command fails, run `qdebug`. The workflow keeps only the latest command log in Alfred's workflow cache. It records command type, foreground app identifiers/process IDs and errors; search query text is not deliberately recorded. Review logs before sharing them. The workflow does not upload logs or read credentials, change the clipboard, install software, or modify Qobuz.

No API keys, Python, Node or additional packages are required. Built-in macOS osascript/JXA is used. Notifications are optional: qdebug opens the log even when notifications are disabled.

## Development and credits

Maintained by **njg001**. Created with substantial assistance from OpenAI Codex, an AI coding tool; debugged with user testing. Unofficial and unaffiliated with Qobuz or Alfred. The icon is an original generic playback graphic.

The readable source is in `workflow/`. To package it, ZIP that directory's contents with `info.plist` at the ZIP root and use the `.alfredworkflow` extension. No auto-updater or compiled binary is included. Licensed under MIT; see LICENSE.

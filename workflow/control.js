/* Targeted UI scripting. No Qobuz scripting dictionary or media-key broadcast. */
function run(argv) {
  var previousApp = null, previousPID = 0, previousID = '', shouldRestore = false, result = '', restoreWarning = '';
  var se;
  function foreground() {
    var apps = se.applicationProcesses.whose({frontmost:true})();
    if (!apps.length) throw Error('No foreground app reported by System Events.');
    return {process:apps[0], id:apps[0].bundleIdentifier() || '', pid:Number(apps[0].unixId())};
  }
  function isAlfred(app) { return app && /^com\.runningwithcrayons\.Alfred/i.test(app.id); }
  function log(message) { console.log('Qobuz Controls 1.1.2: '+message); }
  try {
    var action = argv[0] || '', query = '';
    if (action.indexOf('search ') === 0) { query = action.slice(7); action = 'search'; }
    if (['toggle','next','previous','up','down','search','open','check'].indexOf(action) < 0)
      throw Error('Unknown command');
    se = Application('System Events');
    log('action='+action);
    if (!se.uiElementsEnabled()) throw Error('Enable Alfred in Privacy & Security > Accessibility.');
    if (action === 'check') return 'Accessibility available. Load a Qobuz queue and try qnext.';
    shouldRestore = ['toggle','next','previous','up','down'].indexOf(action) >= 0;
    if (shouldRestore) {
      // Alfred normally dismisses before this script runs. If it has not, wait
      // for it to yield focus so we capture the user's app rather than Alfred.
      for (var attempt=0; attempt<20; attempt++) {
        previousApp = foreground();
        log('captured app='+previousApp.id+' pid='+previousApp.pid);
        if (!isAlfred(previousApp)) break;
        delay(0.05);
      }
      if (!previousApp || isAlfred(previousApp))
        throw Error('Alfred still has focus. Dismiss it and retry; no shortcut sent.');
      previousPID = previousApp.pid;
      previousID = previousApp.id;
      if (previousID === 'com.qobuz.desktop') {
        shouldRestore = false;
        log('Qobuz was already foreground when capture ran; no other app captured.');
      }
    }
    Application('com.qobuz.desktop').activate();
    if (action === 'open') return 'Opened Qobuz.';
    var matches, p;
    for (var i=0; i<60; i++) {
      matches = se.applicationProcesses.whose({bundleIdentifier:'com.qobuz.desktop'})();
      if (matches.length) {
        p=matches[0]; p.frontmost=true;
        if (p.frontmost() && p.windows.length) break;
      }
      delay(0.1);
    }
    if (!p || !p.windows.length || !p.frontmost()) throw Error('Open the Qobuz main window, sign in and retry.');
    delay(0.25);
    se.keyCode(53); delay(0.1);
    // Find the web area, never guess screen coordinates or click an album Play button.
    var all = p.windows[0].entireContents(), web;
    for (var j=0; j<all.length; j++) {
      try { if (all[j].attributes.byName('AXRole').value() === 'AXWebArea') { web=all[j]; break; } } catch (_) {}
    }
    if (!web) throw Error('Qobuz web content is unavailable. Open its main window and retry.');
    try { web.attributes.byName('AXFocused').value=true; }
    catch (_) { throw Error('Could not focus Qobuz safely. Click a blank area, close dialogs and retry.'); }
    if (!p.frontmost()) throw Error('Qobuz lost focus. No shortcut sent.');
    var focused, role;
    try {
      focused=p.attributes.byName('AXFocusedUIElement').value();
      role=focused.attributes.byName('AXRole').value();
    } catch (_) { throw Error('Cannot verify Qobuz focus. No shortcut sent.'); }
    if (['AXTextField','AXTextArea','AXComboBox'].indexOf(role)>=0)
      throw Error('A text field still has focus. Click a blank area in Qobuz and retry.');
    var codes={toggle:49,next:124,previous:123,up:126,down:125};
    if (action==='search') {
      se.keystroke('/'); delay(0.2);
      focused=p.attributes.byName('AXFocusedUIElement').value();
      role=focused.attributes.byName('AXRole').value();
      if (['AXTextField','AXComboBox'].indexOf(role)<0) throw Error('Search did not gain focus. Close dialogs and retry.');
      se.keystroke('a',{using:'command down'});
      se.keystroke(query);
      se.keyCode(36);
    } else if (action==='toggle') se.keyCode(codes[action]);
    else se.keyCode(codes[action],{using:'command down'});
    // Give Qobuz's event handler time to consume the shortcut before switching.
    if (shouldRestore) delay(0.15);
    result = 'Sent Qobuz '+action+'.';
  } catch (e) { result = 'Qobuz: '+e.message; }
  finally {
    if (shouldRestore && previousApp && !isAlfred(previousApp)) {
      try {
        // Do not override a user's intervening switch to a third application.
        var current = foreground();
        log('before restore active='+current.id+' pid='+current.pid);
        if (current.id === 'com.qobuz.desktop') {
          var targets = se.applicationProcesses.whose({unixId:previousPID})();
          if (!targets.length) throw Error('Previous app has quit: '+previousID);
          targets[0].frontmost = true;
          var restored = false;
          for (var retry=0; retry<15; retry++) {
            delay(0.1);
            current = foreground();
            if (current.pid === previousPID) { restored = true; break; }
            if (current.id !== 'com.qobuz.desktop' && !isAlfred(current)) break;
          }
          log('after restore active='+current.id+' pid='+current.pid+' restored='+restored);
          if (!restored) restoreWarning = ' Focus restore failed: target '+previousID+'; active '+current.id+'.';
        } else log('Skipping restore because another app is now active.');
      } catch (restoreError) { restoreWarning = ' Could not restore previous app: '+restoreError.message; }
    }
  }
  log('result='+result+restoreWarning);
  return result + restoreWarning;
}

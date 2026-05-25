"""
Patch login-modal-directive.js to:
1. Only reset scope.password when TRULY going to login state (not on every watch trigger)
2. Add an explicit console.log for debug
"""
import re

path = '/opt/client/node_modules/superdesk-core/scripts/core/auth/login-modal-directive.js'
with open(path, 'r') as f:
    code = f.read()

# The problematic block - reset password only when going to active login state
old = """                scope.$watchGroup([function getSessionToken() {
                    return session.token;
                }, 'requiredLogin'], function showLogin(triggerLogin) {
                    scope.isLoading = false;
                    scope.identity = session.identity;
                    scope.sessionId = session.sessionId;
                    scope.username = session.identity ? session.identity.UserName : null;
                    scope.password = null;
                    if (!triggerLogin[0] && triggerLogin[1] === true) {
                        scope.active = true;
                        var focusElem = scope.username ? 'password' : 'username';

                        element.find('#login-' + focusElem).focus();
                    } else {
                        scope.active = false;
                    }
                });"""

new = """                scope.$watchGroup([function getSessionToken() {
                    return session.token;
                }, 'requiredLogin'], function showLogin(triggerLogin) {
                    scope.isLoading = false;
                    scope.identity = session.identity;
                    scope.sessionId = session.sessionId;
                    scope.username = session.identity ? session.identity.UserName : null;
                    if (!triggerLogin[0] && triggerLogin[1] === true) {
                        scope.password = null;
                        scope.active = true;
                        var focusElem = scope.username ? 'password' : 'username';
                        element.find('#login-' + focusElem).focus();
                    } else {
                        scope.active = false;
                    }
                });"""

if old in code:
    code = code.replace(old, new)
    with open(path, 'w') as f:
        f.write(code)
    print("PATCHED OK")
else:
    print("PATTERN NOT FOUND - checking similarity...")
    # Show what we have
    idx = code.find('scope.$watchGroup')
    print(repr(code[idx:idx+600]))

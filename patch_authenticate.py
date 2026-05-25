"""
Patch login-modal-directive.js authenticate() to fall back to reading
DOM element values when scope.password is null (browser automation / autofill edge case).
"""

path = '/opt/client/node_modules/superdesk-core/scripts/core/auth/login-modal-directive.js'
with open(path, 'r') as f:
    code = f.read()

old = """                scope.authenticate = function() {
                    scope.isLoading = true;
                    scope.loginError = null;
                    auth.login(scope.username || '', scope.password || '')"""

new = """                scope.authenticate = function() {
                    // Fall back to DOM values if ng-model hasn't captured input
                    var pwdEl = document.getElementById('login-password');
                    var usrEl = document.getElementById('login-username');
                    var pwd = scope.password || (pwdEl && pwdEl.value) || '';
                    var usr = scope.username || (usrEl && usrEl.value) || '';
                    scope.isLoading = true;
                    scope.loginError = null;
                    auth.login(usr, pwd)"""

# Also need to fix the rest of the function that uses scope.password/username directly
old2 = """                    auth.login(scope.username || '', scope.password || '')
                        .then(() => {
                            scope.isLoading = false;
                            scope.password = null;
                            reloadRoute();
                        }, (rejection) => {
                            scope.isLoading = false;
                            scope.loginError = rejection.status;
                            if (scope.loginError === 401) {
                                scope.password = null;
                            }
                        });"""

new2 = """                    auth.login(usr, pwd)
                        .then(() => {
                            scope.isLoading = false;
                            scope.password = null;
                            if (pwdEl) pwdEl.value = '';
                            reloadRoute();
                        }, (rejection) => {
                            scope.isLoading = false;
                            scope.loginError = rejection.status;
                            if (scope.loginError === 401) {
                                scope.password = null;
                                if (pwdEl) pwdEl.value = '';
                            }
                        });"""

if old in code:
    code = code.replace(old, new)
    code = code.replace(old2, new2)
    with open(path, 'w') as f:
        f.write(code)
    print("PATCHED OK")
else:
    print("PATTERN NOT FOUND")
    idx = code.find('scope.authenticate')
    print(repr(code[idx:idx+400]))

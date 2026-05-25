"""Write the fixed index.html directly to bypass 9P read cache."""
new_content = r"""<!doctype html>
<html class="no-js">
  <head>
    <base href="/">
    <meta charset="utf-8">
    <title>Maroela Media — Regstreekse blog</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <link rel="icon" href="favicon.ico">
    <style type="text/css">
    html, body { background-color: #f5efe7; font-family: "Lato", "Segoe UI", Roboto, sans-serif; }
    html[data-color-scheme="dark"], html[data-color-scheme="dark"] body { background-color: #111210 !important; color: #f0ebe2; }
    .maroela-portal #main-menu { background: linear-gradient(180deg, #157578 0%, #0d4f52 100%); }
    [ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak { display: none !important; }
    .mm-dark-toggle { position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;width:44px;height:44px;border-radius:50%;border:1px solid rgba(0,0,0,.1);background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s ease,box-shadow .2s ease;padding:0; }
    html[data-color-scheme="dark"] .mm-dark-toggle { background:#1e1b17;border-color:rgba(255,255,255,.15);box-shadow:0 4px 12px rgba(0,0,0,.4); }
    .mm-dark-toggle:hover { transform:scale(1.1);box-shadow:0 6px 18px rgba(0,0,0,.2); }
    .mm-dark-toggle .mm-dt-moon { display:block;color:#0d4f52; }
    .mm-dark-toggle .mm-dt-sun  { display:none;color:#f5c842; }
    .mm-dark-toggle[data-dark="1"] .mm-dt-moon { display:none; }
    .mm-dark-toggle[data-dark="1"] .mm-dt-sun  { display:block; }
    </style>
    <script>
    /* Maroela dark-mode bootstrap — uses document.documentElement (always available in head) */
    (function(){
      var K='maroela-color-scheme';
      var r=document.documentElement;
      function a(s){
        if(s==='dark'){r.setAttribute('data-color-scheme','dark');r.style.backgroundColor='#111210';}
        else if(s==='light'){r.removeAttribute('data-color-scheme');r.style.backgroundColor='';}
        else{
          var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
          if(d){r.setAttribute('data-color-scheme','dark');r.style.backgroundColor='#111210';}
          else{r.removeAttribute('data-color-scheme');r.style.backgroundColor='';}
        }
      }
      var p=localStorage.getItem(K)||'auto';a(p);
      if(window.matchMedia){window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if((localStorage.getItem(K)||'auto')==='auto'){a('auto');}});}
      window.mmSetColorScheme=function(s){localStorage.setItem(K,s||'auto');a(s||'auto');};
      window.mmToggleDarkMode=function(){
        var c=r.getAttribute('data-color-scheme')==='dark'?'dark':'light';
        var n=c==='dark'?'light':'dark';
        localStorage.setItem(K,n);a(n);return n;
      };
    }());
    </script>
  </head>
  <body class="ng-cloak maroela-portal">
    <div sd-superdesk-view></div>
    <div class="dropdown help-link liveblog-help" dropdown style="visibility: hidden">
        <div class="dropdown__toggle" dropdown__toggle style="cursor:pointer">Help <b class="caret"></b></div>
        <ul class="dropdown__menu" style="min-width: 90px;">
            <li><a href="https://liveblog.pro/helpdesk" target="_blank">Helpdesk</a></li>
            <li><a href="https://github.com/liveblog/liveblog" target="_blank">Github</a></li>
            <li translate ng-click="aboutModal = aboutModal? false: true"><button translate>About</button></li>
        </ul>
    </div>
    <div sd-modal="" data-model="aboutModal" class="about-modal modal--large">
        <div class="modal__header">
            <button class="modal__close pull-right" ng-click="$root.aboutModal = false"><i class="icon-close-small"></i></button>
            <h3 class="modal__heading" translate>About</h3>
        </div>
        <div class="modal__body">
            <div>
                <div style="display:inline-block">
                    <div class="text-title">Maroela Media — Regstreekse blog</div>
                    <div class="text-subtitle">Betroubare nuus in Afrikaans, regstreeks</div>
                </div>
                <div style="display:inline-block" class="pull-right">
                    <img src="images/lb-logo-about.png" alt="Maroela Media" class="pull-right">
                </div>
            </div>
            <div class="about-page-text">
                <p>
                    <div style="font-weight: 700" translate>Live Blog 3.93.0</div>
                    <div translate>Released on April 10, 2026</div>
                </p>
                <p translate>Sourcefabric Live Blog — open source live blogging.</p>
                <p translate>Copyright (c) 2014 - 2026 Sourcefabric z.u. Released under <a href="https://github.com/liveblog/liveblog/blob/master/LICENSE" target="_blank">AGPLv3</a>.</p>
            </div>
        </div>
        <div class="modal__footer">
            <button type="button" class="btn btn--primary" translate ng-click="$root.aboutModal = false">CLOSE</button>
        </div>
    </div>
    <button class="mm-dark-toggle" id="mm-dark-toggle"
      onclick="mmToggleDarkMode();document.getElementById('mm-dark-toggle').setAttribute('data-dark',document.documentElement.getAttribute('data-color-scheme')==='dark'?'1':'0');"
      title="Donker / lig modus" aria-label="Wissel donker modus">
      <svg class="mm-dt-moon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <svg class="mm-dt-sun" viewBox="0 0 24 24" fill="none" stroke="#f5c842" stroke-width="2.5" stroke-linecap="round" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="#f5c842"/>
        <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
        <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
      </svg>
    </button>
    <script>(function(){var b=document.getElementById('mm-dark-toggle');if(b){b.setAttribute('data-dark',document.documentElement.getAttribute('data-color-scheme')==='dark'?'1':'0');}})();</script>
    <script src="config.js"></script>
    <script src="sir-trevor.js"></script>
    <script src="app.bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.33.1/ace.js" integrity="sha512-WN1CEDE9Js0mEqvtRrNS7GHS+arRJxWVO03zttkQQXEQjwGVcHQ2kMja415m0bNeB3AtYsyjUWJ1BS4wGLta/Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  </body>
</html>"""

with open('/opt/client/app/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
with open('/opt/client/app/index.html', 'r') as f:
    check = f.read()

print("WRITE OK")
print("Has documentElement:", 'document.documentElement' in check)
print("Has document.body.setAttribute:", 'document.body.setAttribute' in check)

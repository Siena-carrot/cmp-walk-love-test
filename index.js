/* index.js — splash control extracted from index.html */
(function(){
  try{
    var shown = sessionStorage.getItem('indexSplashShown');
    var ref = document.referrer || '';
    var shouldShow = false;
    if (shown !== 'true'){
      if (!ref) {
        shouldShow = true;
      } else {
        try{
          var r = new URL(ref);
          if (r.origin !== location.origin) shouldShow = true;
        }catch(e){
          // if referrer parsing fails, be conservative and show
          shouldShow = true;
        }
      }
    }
    if (!shouldShow) return;

    function showSplash(){
      var overlay = document.getElementById('splashOverlay');
      if (!overlay) return;
      overlay.setAttribute('aria-hidden','false');
      // force a reflow so transition will run reliably
      overlay.getBoundingClientRect();
      overlay.classList.add('visible');
      sessionStorage.setItem('indexSplashShown','true');
      var hide = function(){
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden','true');
        // After the overlay fade-out finishes, remove the early-page-hide class so the page becomes visible again
        setTimeout(function(){
          try{ document.documentElement.classList.remove('splash-active'); }catch(e){}
          try{ overlay.style.display='none'; }catch(e){}
        }, 650);
      };
      overlay.addEventListener('click', hide);
  // auto-hide after 1.4s (shorter display per user request)
  setTimeout(hide, 1400);
    }

    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', showSplash);
    } else {
      // DOMContentLoaded already fired — run immediately
      showSplash();
    }
  }catch(e){}
})();

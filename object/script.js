document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = localStorage.getItem("adminLoggedIn");
  const loginStatus = document.getElementById("loginStatus");
  const loginButton = document.getElementById("loginButton");
  const mailButtonArea = document.getElementById("mailButtonArea");
  // create or wire up logout button (will be inserted into .top-bar)
  function ensureLogoutButton() {
    let btn = document.getElementById('logoutButton');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'logoutButton';
      btn.type = 'button';
      btn.textContent = 'ログアウトする';
      btn.style.display = 'none';
      btn.onclick = handleLogoutClick;
      // insert after loginStatus and before mailButtonArea if possible
      const topBar = loginStatus && loginStatus.parentNode;
      if (topBar) {
        // find mailButtonArea to insert before it
        if (mailButtonArea && mailButtonArea.parentNode === topBar) {
          topBar.insertBefore(btn, mailButtonArea);
        } else {
          topBar.appendChild(btn);
        }
      } else {
        document.body.appendChild(btn);
      }
    }
    return btn;
  }

  function handleLogoutClick() {
    try {
      const ok = confirm('ログアウトしますか？');
      if (!ok) return;
      // remove admin and master flags but keep other data (restored, mail read, etc.)
      try { localStorage.removeItem('adminLoggedIn'); } catch (e) {}
      try { localStorage.removeItem('masterLoggedIn'); } catch (e) {}
      // update UI immediately
      updateAuthUI();
      alert('ログアウトしました');
    } catch (e) { console.error('logout error', e); }
  }

  function updateAuthUI() {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    const isMaster = localStorage.getItem('masterLoggedIn') === 'true';
    const logoutBtn = ensureLogoutButton();
    if (isAdmin) {
      loginStatus.textContent = '管理者として作業中';
      logoutBtn.style.display = 'inline-block';
      mailButtonArea.style.display = 'block';
      loginButton.style.display = 'none';
      // if master not logged but all restored, show master prompt (handled elsewhere)
    } else {
      // not admin
      loginStatus.textContent = '';
      logoutBtn.style.display = 'none';
      mailButtonArea.style.display = 'none';
      loginButton.style.display = 'inline-block';
    }
  }

  if (loggedIn === "true") {
    // initial UI wiring for authenticated admin
    ensureLogoutButton();
    loginStatus.textContent = "管理者として作業中";
    mailButtonArea.style.display = "block";
    // show logout button when admin
    try { document.getElementById('logoutButton').style.display = 'inline-block'; } catch (e) {}
  } else {
    loginStatus.textContent = "";
    loginButton.style.display = "inline-block";
  }

  if (!localStorage.getItem("objectPageVisited")) {
    // show a pre-login warning popup first; user then presses 'ログインする'
    // to open the actual login popup.
    openPreLoginPopup();
    localStorage.setItem("objectPageVisited", "true");
  }

  // If a set of objects are all restored, require master login on index page
  const masterTargets = [2,3,5,7,8,9,11];
  const masterLogged = localStorage.getItem('masterLoggedIn');
  // helper to determine restored-like state for an object
  function isObjectRestored(n) {
    const fixed = localStorage.getItem(`obje${n}Fixed`);
    const ans = localStorage.getItem(`obje${n}Answer`);
    const goodValues = ['c1','answer','ok','fixed','normal','true','solved','restored','1'];
    if (fixed && (fixed === 'restored' || fixed === '1')) return true;
    if (ans && goodValues.indexOf(String(ans).toLowerCase()) !== -1) return true;
    return false;
  }

  const allRestored = masterTargets.every(n => isObjectRestored(n));
  if (allRestored && masterLogged !== 'true') {
    // Show the intermediate "all restored" popup automatically only once
    // (first time the site detects all targets restored). Subsequent attempts
    // (e.g. clicking the top-right prompt) should directly open the master
    // login popup.
    try {
      const notified = localStorage.getItem('allRestoredNotified');
      if (!notified) {
        openAllRestoredPopup();
        try { localStorage.setItem('allRestoredNotified', 'true'); } catch (e) {}
      }
    } catch (e) { console.warn('could not read/write allRestoredNotified', e); }

    // Highlight master auth needed in the top-right login status area and
    // make the top-right control open the master login directly.
    try {
      const loginStatusEl = document.getElementById('loginStatus');
    if (loginStatusEl) {
        // Create a dedicated clickable span so the hit-area is limited to the
        // visible control, not the entire #loginStatus container (which is
        // styled as a block and would otherwise become fully clickable).
        const span = document.createElement('span');
        span.className = 'master-auth-prompt';
        span.textContent = 'マスターパスワード認証する';
        // make only the span show the pointer and handle clicks
        span.style.cursor = 'pointer';
  span.onclick = function (e) { e.stopPropagation(); openMasterPopup(); };
        // clear any previous content and append the new span
        loginStatusEl.innerHTML = '';
        loginStatusEl.appendChild(span);
      }
    } catch (e) { console.warn('could not update loginStatus to show master auth needed', e); }
  }

  // If a previous master login set a flag to show new mail popup after reload, show it now
  if (localStorage.getItem('showNewMailPopup') === 'true') {
    // If a 'mail5' entry was published (by submitMasterLogin), prefer that so the
    // date reflects the actual master-auth time. Otherwise only set a fallback
    // selectedMail if none exists yet.
    try {
      const published = localStorage.getItem('mail5');
      if (published) {
        localStorage.setItem('selectedMail', published);
      } else if (!localStorage.getItem('selectedMail')) {
        const mail5 = {
          id: 5,
          subject: 'サイト復旧のお礼',
          sender: 'Siena',
          date: '2025年10月23日 10:44',
          body: 'このメールを受け取られた方へ\n\nはじめまして。\n大阪大学CMP walk愛好会の会長の「Siena」と申します。\n\nこのたび、わたくくしどもが作成したサイトにて不具合が発生してしまい申し訳ございませんでした。\nまた、復旧のための作業をご実施くださり誠にありがとうございます。感謝してもしきれません。\n\nサイトに不具合が生じているとのご報告は受けていたのですが、パスワードを書いておいたメモを紛失してしまい、ログインできずにおりました。お恥ずかしい限りです。\n\n最初のパスワードのほうは思い出せたのですが、マスターパスワードがまだ思い出せません。重ね重ねお手数おかけし申し訳ございませんが、わたしの個人メールアドレス（もしくは愛好会の公式Twitter（@UOsaka_CMPwalk）のDM宛に、マスターパスワードをお送りいただけないでしょうか。\n（最悪がんばって思い出すので、必ずお送りいただかなくても大丈夫です）\n\n今回のお礼についてですが、かなり先になっていしまい申し訳ございませんが、2026年のいちょう祭にてお渡しさせていただければと思います。場所や時間の詳細は近くなりましたら公式Xにて発信いたしますので、ご確認いただけますと幸いです。\n\n改めまして、このたびはサイトの復旧のご対応、誠にありがとうございました。\n\n\n大阪大学CMP walk愛好会 会長 Siena',
          read: false
        };
        localStorage.setItem('selectedMail', JSON.stringify(mail5));
      }
    } catch (e) { console.warn('could not set selectedMail for new mail popup', e); }
    openNewMailPopup();
    localStorage.removeItem('showNewMailPopup');
  }

  // Note: badge/checkmark feature removed per request — no initial per-card checkmarks

  // 非管理者の場合、obje1 のタイトルを短縮表示にする
  if (loggedIn !== "true") {
    const title1 = document.querySelector("#card-obje1 .card-title");
    if (title1) {
      // もとの長いタイトルを短く置き換える
      title1.textContent = '旧制浪速高等学校学生像';
    }
  }

  // set thumbnails for certain objects (normal / error) based on localStorage state
  // initial pass for configured objects
  const thumbTargets = [1,2,3,5,7,8,9,11,13];
  thumbTargets.forEach(n => setThumbnailState(n));

  // Prevent non-admin users from opening object pages that are currently in error.
  // If a card's object is not considered restored, block the link and prompt login.
  try {
    document.querySelectorAll('.object-card a').forEach(a => {
      const card = a.closest('.object-card');
      if (!card || !card.id) return;
      const m = card.id.match(/^card-obje(\d+)$/);
      if (!m) return;
      const n = parseInt(m[1], 10);
      a.addEventListener('click', function(e) {
        try {
          const isRest = isObjectRestored(n);
          const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
          if (!isRest && !isAdmin) {
            e.preventDefault();
            // give the user a clear prompt and open the pre-login popup so they can log in
            try { openPreLoginPopup(); } catch (ex) { /* fall back to alert */ }
            alert('このオブジェクトの詳細ページは現在閲覧できません');
          }
        } catch (err) { console.error('card click guard error', err); }
      });
    });
  } catch (e) { console.error('could not attach card click guards', e); }

  // badge/checkmark feature removed; we only set thumbnails

  // listen for storage changes from other tabs/windows and update thumbnails/badges live
  window.addEventListener('storage', (ev) => {
    try {
      if (!ev.key) return; // clear event
      // If another tab published 'mail5', use it and open the popup so the admin can view it
      if (ev.key === 'mail5') {
        try {
          if (ev.newValue) localStorage.setItem('selectedMail', ev.newValue);
        } catch (e) { console.warn('could not set selectedMail on mail5 storage event', e); }
        openNewMailPopup();
        // update mail button badge since mail5 changed
        try { updateMailButtonUI(); } catch (e) {}
      }
      // match keys like 'objeNAnswer' or 'objeNFixed' or 'objeNStatus'
      const m = ev.key.match(/^obje(\d+)(Answer|Fixed|Status|LockUntil)?$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (thumbTargets.indexOf(n) !== -1) setThumbnailState(n);
      }
      // If a per-mail read flag changed (for id=5), update mail button badge
      if (ev.key && ev.key.startsWith('mailRead:')) {
        try { updateMailButtonUI(); } catch (e) {}
      }
    } catch (e) {
      console.error('storage listener error', e);
    }
  });

  // initialize mail button badge state
  try { updateMailButtonUI(); } catch (e) {}
});

// Open/close functions for the new-mail popup
function openNewMailPopup() {
  const el = document.getElementById('newMailPopup');
  if (el) el.style.display = 'flex';
}

function closeNewMailPopup(fromX) {
  const el = document.getElementById('newMailPopup');
  if (el) el.style.display = 'none';
  // If user closed via the × (fromX === true) and mail5 exists and is unread,
  // show the unread badge on the mail button.
  try {
    if (fromX) updateMailButtonUI();
  } catch (e) { console.warn('closeNewMailPopup update badge error', e); }
}

// Update the mail button UI (badge) based on mail5 presence and read flag
function updateMailButtonUI() {
  try {
    const badge = document.getElementById('mailUnreadBadge');
    const mailArea = document.getElementById('mailButtonArea');
    if (!badge || !mailArea) return;
    // If mail5 is present and mailRead:5 is not true, show badge
    const mail5Raw = localStorage.getItem('mail5') || localStorage.getItem('selectedMail');
    let hasUnread = false;
    if (mail5Raw) {
      try {
        const m = typeof mail5Raw === 'string' ? JSON.parse(mail5Raw) : mail5Raw;
        if (m && Number(m.id) === 5) {
          const readFlag = localStorage.getItem('mailRead:5');
          if (readFlag !== 'true') hasUnread = true;
        }
      } catch (e) { /* ignore parse errors */ }
    }
    badge.style.display = hasUnread ? 'block' : 'none';
  } catch (e) { console.warn('updateMailButtonUI error', e); }
}

// Called when user clicks 確認する in the new-mail popup
function confirmNewMail() {
  try { /* selectedMail already set when popup opened */ } catch (e) {}
  // Navigate to mailbox/detail (selectedMail will be used by mailbox page)
  location.href = '../mail/mailbox/index.html';
}

function openLoginPopup() {
  document.getElementById("loginPopup").style.display = "flex";
}

// Pre-login warning popup controls
function openPreLoginPopup() {
  const el = document.getElementById('preLoginWarningPopup');
  if (el) el.style.display = 'flex';
}

function closePreLoginPopup() {
  const el = document.getElementById('preLoginWarningPopup');
  if (el) el.style.display = 'none';
}

// Called by the 'ログインする' button inside the pre-login warning popup
function openLoginFromPre() {
  try { closePreLoginPopup(); } catch (e) {}
  openLoginPopup();
}

function closeLoginPopup() {
  document.getElementById("loginPopup").style.display = "none";
}

function openHintPopup() {
  document.getElementById("hintPopup").style.display = "flex";
}

function closeHintPopup() {
  document.getElementById("hintPopup").style.display = "none";
}

// Master hint popup controls
function openMasterHintPopup() {
  const el = document.getElementById('masterHintPopup');
  if (el) el.style.display = 'flex';
}

function closeMasterHintPopup() {
  const el = document.getElementById('masterHintPopup');
  if (el) el.style.display = 'none';
}

function submitLogin() {
  // Admin password is checked by comparing SHA-256(input) to the stored hash.
  // Replace ADMIN_PASSWORD_HASH with the hex digest computed locally.
  const ADMIN_PASSWORD_HASH = 'c174937d80c0c1b27d132769be2cf4259e9592c5cd9d579e74b16c3930ae4d41';
  const input = document.getElementById("adminPassword").value.trim();
  return sha256Hex(input).then(h => {
    if (h === ADMIN_PASSWORD_HASH) {
      // mark admin as logged in
      localStorage.setItem("adminLoggedIn", "true");
    // When an admin logs in, consider obje1 restored so its thumbnail/state
    // becomes 'normal' and this persists across logout (stored in localStorage).
    try {
      localStorage.setItem('obje1Fixed', 'restored');
    } catch (e) { console.warn('could not set obje1Fixed', e); }
    // Attempt to immediately update the thumbnail UI for obje1 so the change
    // is visible before reload (best-effort; page will reload right after).
    try { setThumbnailState(1); } catch (e) { /* ignore */ }
    fetch('https://rd.maltonn.com/log?c=cmpwalk&action=adminlogin').then(()=>{}).catch(()=>{});
    alert("ログインしました");
    location.reload();
    } else {
      fetch('https://rd.maltonn.com/log?c=cmpwalk&action=passwordwrong').then(()=>{}).catch(()=>{});
      alert("パスワードが違います");
    }
  }).catch(e => { console.error('hash error', e); alert('エラーが発生しました'); });
  
}

// Master popup controls
function openMasterPopup() {
  fetch('https://rd.maltonn.com/log?c=cmpwalk&action=clearAll').then(()=>{}).catch(()=>{});
  document.getElementById('masterLoginPopup').style.display = 'flex';
}

function closeMasterPopup() {
  document.getElementById('masterLoginPopup').style.display = 'none';
}

function submitMasterLogin() {
  // Master password is checked by comparing SHA-256(input) to the stored hash.
  // Replace MASTER_PASSWORD_HASH with the hex digest computed locally.
  const MASTER_PASSWORD_HASH = 'dc68abf15032c196f220d604c41df682636fda7e7edc3a67e74831327b970ae1';
  const input = document.getElementById('masterPassword').value.trim();
  return sha256Hex(input).then(h => {
    fetch('https://rd.maltonn.com/log?c=cmpwalk&action=masterlogin').then(()=>{}).catch(()=>{});
    // exact master password required
    if (h === MASTER_PASSWORD_HASH) {
      localStorage.setItem('masterLoggedIn', 'true');
    // Prepare the admin-only mail (id=5) so that mailbox can display it after navigation
    try {
      // set date to current datetime (日本語形式 with time) so list/detail show auth time
      const now = new Date();
      const nowStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const mail5 = {
        id: 5,
        subject: 'サイト復旧のお礼',
        sender: 'Siena',
        date: nowStr,
        body: 'このメールを受け取られた方へ\n\nはじめまして。\n大阪大学CMP walk愛好会の会長の「Siena」と申します。\n\nこのたび、わたくくしどもが作成したサイトにて不具合が発生してしまい申し訳ございませんでした。\nまた、復旧のための作業をご実施くださり誠にありがとうございます。感謝してもしきれません。\n\nサイトに不具合が生じているとのご報告は受けていたのですが、パスワードを書いておいたメモを紛失してしまい、ログインできずにおりました。お恥ずかしい限りです。\n\n最初のパスワードのほうは思い出せたのですが、マスターパスワードがまだ思い出せません。重ね重ねお手数おかけし申し訳ございませんが、わたしの個人メールアドレス（もしくは愛好会の公式Twitter（@UOsaka_CMPwalk）のDM宛に、マスターパスワードをお送りいただけないでしょうか。\n（最悪がんばって思い出すので、必ずお送りいただかなくても大丈夫です）\n\n今回のお礼についてですが、かなり先になっていしまい申し訳ございませんが、2026年のいちょう祭にてお渡しさせていただければと思います。場所や時間の詳細は近くなりましたら公式Xにて発信いたしますので、ご確認いただけますと幸いです。\n\n改めまして、このたびはサイトの復旧のご対応、誠にありがとうございました。\n\n\n大阪大学CMP walk愛好会 会長 Siena',
        read: false
      };
      localStorage.setItem('selectedMail', JSON.stringify(mail5));
      // also publish mail5 to storage so mail list in other tabs updates its mails[] entry
      localStorage.setItem('mail5', JSON.stringify(mail5));
      // set a flag so that after reload we can show the mail popup on index if needed
      localStorage.setItem('showNewMailPopup', 'true');
    } catch (e) { console.warn('could not prepare selectedMail', e); }
    alert('マスターログインに成功しました');
    // remove the awaiting background before reload (reload would clear it anyway)
    try { document.body.classList.remove('awaiting-master-auth'); } catch (e) {}
    closeMasterPopup();
    location.reload();
    } else {
      alert('マスターパスワードが違います');
    }
  }).catch(e => { console.error('hash error', e); alert('エラーが発生しました'); });
}

// Note: do NOT remove the awaiting-master-auth class when the user cancels
// the master popup; keep the page tinted until master authentication occurs.

// Set the card thumbnail for object n. Uses data-normal / data-error attributes on the img.
function setThumbnailState(n) {
  try {
    const img = document.querySelector(`#card-obje${n} .card-image`);
    if (!img) return;
    const normalSrc = img.dataset.normal;
    const errorSrc = img.dataset.error;

  // Determine state: default to error for thumbnail targets (show broken/404 image
  // unless the object is explicitly restored/fixed or has a known-good answer).
  let state = 'error';

    // Priority checks
    const fixed = localStorage.getItem(`obje${n}Fixed`);
    const ans = localStorage.getItem(`obje${n}Answer`);
    const st = localStorage.getItem(`obje${n}Status`) || '';

    // If explicitly fixed, show normal (accept legacy '1' and new 'restored')
    if (fixed === '1' || fixed === 'restored') {
      state = 'normal';
    } else {
      // If an answer exists and is a known-good value, treat as normal; otherwise remain error
      const goodValues = ['c1', 'answer', 'ok', 'fixed', 'normal', 'true', 'solved', 'restored'];
      if (ans) {
        const ansNorm = String(ans).trim().toLowerCase();
        if (goodValues.indexOf(ansNorm) !== -1) state = 'normal';
        else state = 'error';
      } else {
        // no answer and not fixed -> keep error (show 404/broken thumb)
        state = 'error';
      }
    }

    // Debug logging to help trace unexpected cases
    console.debug(`setThumbnailState obje${n}: fixed=${fixed}, answer=${ans}, status=${st}, resolved=${state}`);

    if (state === 'error' && errorSrc) img.src = errorSrc;
    else if (normalSrc) img.src = normalSrc;

    // Add or remove visual error indicator (red border) on the object card
    try {
      const card = document.getElementById(`card-obje${n}`);
      if (card) {
        // Exception: obje13 should never show the red error border
        if (n === 13) {
          card.classList.remove('error');
        } else {
          if (state === 'error') card.classList.add('error');
          else card.classList.remove('error');
        }
      }
    } catch (e) { /* ignore DOM errors */ }
  } catch (e) {
    // silent fail to avoid breaking the page
    console.error('setThumbnailState error for', n, e);
  }
}

// Badge/update checkmark feature removed — keep function as noop for compatibility
function updateBadge(n) {
  // intentionally empty
}

// Utility: compute SHA-256 hex digest of a UTF-8 string using Web Crypto
function sha256Hex(str) {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(String(str || ''));
    return window.crypto.subtle.digest('SHA-256', data).then(buf => {
      const bytes = new Uint8Array(buf);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += ('00' + bytes[i].toString(16)).slice(-2);
      }
      return hex;
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

// All-restored popup controls — user sees this first, then presses とじる to
// proceed to the master login popup.
function openAllRestoredPopup() {
  const el = document.getElementById('allRestoredPopup');
  if (el) el.style.display = 'flex';
}

function closeAllRestoredPopup() {
  const el = document.getElementById('allRestoredPopup');
  if (el) el.style.display = 'none';
  // After closing the notification, open the master login popup
  try {
    // apply a page-level class so the background becomes a faint red until
    // master authentication completes (or is cancelled)
    try { document.body.classList.add('awaiting-master-auth'); } catch (e) {}
    openMasterPopup();
  } catch (e) { console.warn('could not open master popup after closing allRestored', e); }
}
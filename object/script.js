document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = localStorage.getItem("adminLoggedIn");
  const loginStatus = document.getElementById("loginStatus");
  const loginButton = document.getElementById("loginButton");
  const mailButtonArea = document.getElementById("mailButtonArea");

  if (loggedIn === "true") {
    loginStatus.textContent = "管理者として作業中";
    mailButtonArea.style.display = "block";
  } else {
    loginStatus.textContent = "";
    loginButton.style.display = "inline-block";
  }

  if (!localStorage.getItem("objectPageVisited")) {
    openLoginPopup();
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
    // show master login popup and prevent browsing until master login
    openMasterPopup();
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
  const thumbTargets = [2,3,5,7,11,13];
  thumbTargets.forEach(n => setThumbnailState(n));

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
  const input = document.getElementById("adminPassword").value.trim();
  if (input === "友よ我らぞ光よと") {
    localStorage.setItem("adminLoggedIn", "true");
    alert("ログインしました");
    location.reload();
  } else {
    alert("パスワードが違います");
  }
  
}

// Master popup controls
function openMasterPopup() {
  document.getElementById('masterLoginPopup').style.display = 'flex';
}

function closeMasterPopup() {
  document.getElementById('masterLoginPopup').style.display = 'none';
}

function submitMasterLogin() {
  const input = document.getElementById('masterPassword').value.trim();
  // exact master password required
  if (input === '青春の三春秋') {
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
    closeMasterPopup();
    location.reload();
  } else {
    alert('マスターパスワードが違います');
  }
}

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
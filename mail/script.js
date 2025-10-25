const mails = [
  // IDs re-assigned so that "メールテスト" has id = 1 (so it corresponds to mail1)
  {
    id: 5,
    subject: "サイト復旧のお礼",
    sender: "Siena",
    date: "2025年10月23日 10:44",
    body: "このメールを受け取られた方へ\n\nはじめまして。\n大阪大学CMP walk愛好会の会長の「Siena」と申します。\n\nこのたび、わたくしどもが作成したサイトにて不具合が発生してしまい申し訳ございませんでした。\nまた、復旧のための作業をご実施くださり誠にありがとうございます。感謝してもしきれません。\n\nサイトに不具合が生じているとのご報告は受けていたのですが、パスワードを書いておいたメモを紛失してしまい、ログインできずにおりました。お恥ずかしい限りです。\n\n最初のパスワードのほうは思い出せたのですが、マスターパスワードがまだ思い出せません。重ね重ねお手数おかけし申し訳ございませんが、わたしの個人メールアドレス（もしくは愛好会の公式Twitter（@UOsaka_CMPwalk）のDM宛に、マスターパスワードをお送りいただけないでしょうか。\n（最悪がんばって思い出すので、必ずお送りいただかなくても大丈夫です）\n\n今回のお礼についてですが、かなり先になっていしまい申し訳ございませんが、2026年のいちょう祭にてお渡しさせていただければと思います。場所や時間の詳細は近くなりましたら公式Xにて発信いたしますので、ご確認いただけますと幸いです。\n\n改めまして、このたびはサイトの復旧のご対応、誠にありがとうございました。\n\n\n大阪大学CMP walk愛好会 会長 Siena",
    read: false
  },
  {
    id: 4,
    subject: "商品発送のお知らせ",
    sender: "東都印刷株式会社",
    date: "2025年10月23日 10:44",
    body: "大阪大学CMPwalk愛好会 様\n\n東都印刷株式会社 藤堂です。お世話になっております。\n\nご注文いただきました商品を発送いたしましたので、ご連絡いたします。\n\n納品書がご必要なお客様は本メールへの返信にてお知らせください。\n\n\n東都印刷株式会社 藤堂",
    read: true
  },
  {
    id: 3,
    subject: "データチェック完了のお知らせ",
    sender: "東都印刷株式会社",
    date: "2025年10月16日 13:02",
    body: "大阪大学CMPwalk愛好会 様\n\n東都印刷株式会社 藤堂です。お世話になっております。\n\nこのたびはご注文ありがとうございます。\nご入稿データの確認が完了しました。\n\nデータ通りの内容で印刷工程進行いたします。\n\n\n発送予定日：2025年10月23日\n\n\n東都印刷株式会社 藤堂",
    read: true
  },
  {
    id: 2,
    subject: "ご注文ありがとうございます",
    sender: "東都印刷株式会社",
    date: "2025年10月14日 23:58",
    body: "大阪大学CMPwalk愛好会 様\n\n東都印刷株式会社です。お世話になります。\n\n※このメールは、システムより自動配信されております。\n\nこのたびは当店よりご注文いただき、誠にありがとうございます。\nご注文について、下記の遠い受付いたしました。\n\n━━━━━  注文情報  ━━━━━\n\n【種類】コットントートバッグM\n【印刷方法】インクジェット片面\n【個数】10個\n【単価】605円\n【送料】990円\n【請求総額】7,040円\n━━━━━━━━━━━━━━━\n\nただいまより、ご入稿いただいたデータのチェックを行います。納期は追ってご連絡差し上げますので、ご確認をよろしくお願いいたします。\n\n東都印刷株式会社",
    read: true
  },
  {
    id: 1,
    subject: "メールテスト",
    sender: "Siena",
    date: "2025年10月13日 22:31",
    body: "あ\n\niPhoneから送信",
    read: true
  }
];

const mailList = document.getElementById("mailList");

// If a mail5 object was published (for master login), apply it to the in-memory mails[]
// before the initial render so the correct datetime appears in the list on the same tab.
try {
  const stored = localStorage.getItem('mail5');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.id === 5) {
      const idx = mails.findIndex(m => m.id === 5);
      if (idx !== -1) mails[idx] = parsed;
      else mails.unshift(parsed);
    }
  }
} catch (e) {
  console.warn('could not apply stored mail5 at startup', e);
}

// Apply persisted per-mail read flags from localStorage (keys like 'mailRead:<id>').
// This ensures that when returning from the detail page the list shows the
// updated read/unread background.
try {
  mails.forEach(m => {
    try {
      const v = localStorage.getItem('mailRead:' + m.id);
      if (v === 'true') m.read = true;
    } catch (e) {
      /* ignore per-mail read read errors for this mail */
    }
  });
} catch (e) {
  console.warn('could not apply persisted read flags', e);
}

 // Helpers to parse and format dates robustly
 function parseDateString(s) {
   if (!s) return null;
   // Try Japanese format like "2025年10月13日 22:31"
   const jp = s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:\s*(\d{1,2}):(\d{2}))?/);
   if (jp) {
     const y = Number(jp[1]), m = Number(jp[2]) - 1, d = Number(jp[3]);
     const hh = jp[4] ? Number(jp[4]) : 0;
     const mm = jp[5] ? Number(jp[5]) : 0;
     return { date: new Date(y, m, d, hh, mm), hasTime: !!jp[4] };
   }
   // Try ISO-ish formats
   const iso = new Date(s);
   if (!isNaN(iso)) return { date: iso, hasTime: /T|:\d{2}/.test(s) };
   return null;
 }

 function formatListDate(s) {
   const p = parseDateString(s);
   if (!p) return s || '';
   const d = p.date;
   return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
 }

 function formatDetailDate(s) {
   const p = parseDateString(s);
   if (!p) return s || '';
   const d = p.date;
   const hh = String(d.getHours()).padStart(2, '0');
   const mm = String(d.getMinutes()).padStart(2, '0');
   if (p.hasTime) return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${hh}:${mm}`;
   return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
 }

// Create a preview from the body: ignore internal newlines and collapse whitespace,
// then truncate to `limit` characters and append an ellipsis '…' if truncated.
function makePreviewFromBody(body, limit = 40) {
  if (!body) return '';
  // Normalize CRLF and collapse all whitespace (including newlines) to single spaces
  const collapsed = body.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  if (collapsed.length <= limit) return collapsed;
  return collapsed.slice(0, limit) + '…';
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

 // Render the mail list in descending order by date (newest first).
 function renderList() {
   // sort copy to avoid mutating original order unnecessarily
   mails.sort((a, b) => {
     const pa = parseDateString(a.date);
     const pb = parseDateString(b.date);
     const da = pa ? pa.date : new Date(0);
     const db = pb ? pb.date : new Date(0);
     return db - da; // descending
   });

   mailList.innerHTML = '';
   mails.forEach(mail => {
    // Hide mail with id=5 unless masterLoggedIn === 'true'
    const masterLogged = localStorage.getItem('masterLoggedIn') === 'true';
    if (mail.id === 5 && !masterLogged) return; // skip rendering
    const item = document.createElement("div");
     item.className = "mail-item " + (mail.read ? "read" : "unread");

     const subject = escapeHtml(mail.subject || '');
     const sender = escapeHtml(mail.sender || '');
     const dateStr = escapeHtml(formatListDate(mail.date));
     const previewText = escapeHtml(makePreviewFromBody(mail.body));

     item.innerHTML = `
      <div class="mail-meta">
        <span class="mail-subject">${subject}</span>
        <span class="mail-sender">${sender}</span>
        <span class="mail-date">${dateStr}</span>
      </div>
      <div class="mail-preview">${previewText}</div>
    `;

    // Navigate to mail detail page when clicked (save selected mail to localStorage)
    item.onclick = () => {
      try { localStorage.setItem('selectedMail', JSON.stringify(mail)); } catch (e) { console.warn('could not save selectedMail', e); }
      // keep existing behavior of navigating to the single detail page (mailbox)
      location.href = 'mailbox/index.html';
    };
    mailList.appendChild(item);
  });
 }

// Re-render when masterLoggedIn changes in other tabs
window.addEventListener('storage', (ev) => {
  if (!ev.key) return;
  if (ev.key === 'masterLoggedIn') {
    renderList();
  }
  // If a 'mail5' object is published to localStorage (by master login), update mails[] and re-render
  if (ev.key === 'mail5') {
    try {
      const newMail = JSON.parse(ev.newValue);
      if (newMail && newMail.id === 5) {
        const idx = mails.findIndex(m => m.id === 5);
        if (idx !== -1) mails[idx] = newMail;
        else mails.unshift(newMail);
        renderList();
      }
    } catch (e) { console.warn('failed to apply mail5 from storage event', e); }
  }
    // If a per-mail read flag changed (key like 'mailRead:<id>'), apply it to mails[] and re-render
    if (ev.key && ev.key.startsWith('mailRead:')) {
      try {
        const idPart = ev.key.split(':')[1];
        const id = Number(idPart);
        const idx = mails.findIndex(m => m.id === id);
        if (idx !== -1) {
          mails[idx].read = ev.newValue === 'true';
          renderList();
        }
      } catch (e) { console.warn('failed to apply mailRead storage event', e); }
    }
});
 
 // Helper to add a new mail at the top (newest-first behavior)
 function addMail(mailObj) {
   mails.unshift(mailObj);
   renderList();
 }
 
 // initial render
 renderList();

function openMail(mail) {
  document.getElementById("popupSubject").textContent = mail.subject;
  document.getElementById("popupSender").textContent = mail.sender;
  document.getElementById("popupDate").textContent = mail.date;
  document.getElementById("popupBody").textContent = mail.body;
  document.getElementById("mailPopup").style.display = "block";

  // NOTE: do not auto-mark mail as read here. Read-state is controlled explicitly
  // (the UI shows read/unread classes based on the mail.read flag). We avoid
  // automatically changing read state on popup open so behaviour is deterministic
  // and matches the user's request to remove implicit read-detection.
}

function closePopup() {
  document.getElementById("mailPopup").style.display = "none";
}

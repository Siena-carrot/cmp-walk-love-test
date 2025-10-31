const newsItems = [
  {
    id: 3,
    subject: "【重要】サイトの不具合について",
    date: "2025年11月1日 0:00",
    body: "現在、オブジェクトの個別紹介サイトが一部正しく表示されない不具合が発生しております。\nご迷惑をおかけし、大変申し訳ございません\n\n現時点で復旧のめどは立っておりません。\n管理者としてログインすることで、不具合を修復することが可能です。あまりに勝手なお願いで恐縮ですが、パスワードがわかるようでしたらどなたでも構いませんので、復旧作業にご協力いただけないでしょうか。",
  },
  {
    id: 2,
    subject: "紹介オブジェクトが追加されました！",
    date: "2025年10月30日 12:32",
    body: "新たに２つの紹介オブジェクトを追加いたしました。ぜひご覧ください！",
  },
  {
    id: 1,
    subject: "紹介オブジェクトが追加されました！",
    date: "2025年10月29日 18:42",
    body: "新たに３つの紹介オブジェクトを追加いたしました。ぜひご覧ください！",
  }
];

const newsList = document.getElementById("newsList");

try {
  const stored = localStorage.getItem('news5');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.id === 5) {
      const idx = newsItems.findIndex(m => m.id === 5);
      if (idx !== -1) newsItems[idx] = parsed;
      else newsItems.unshift(parsed);
    }
  }
} catch (e) {
  console.warn('could not apply stored news5 at startup', e);
}

try {
  // News does not track per-item read/unread state; skip persisted read flags.
} catch (e) {
  /* no-op */
}

function parseDateString(s) {
  if (!s) return null;
  const jp = s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:\s*(\d{1,2}):(\d{2}))?/);
  if (jp) {
    const y = Number(jp[1]), m = Number(jp[2]) - 1, d = Number(jp[3]);
    const hh = jp[4] ? Number(jp[4]) : 0;
    const mm = jp[5] ? Number(jp[5]) : 0;
    return { date: new Date(y, m, d, hh, mm), hasTime: !!jp[4] };
  }
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

function makePreviewFromBody(body, limit = 40) {
  if (!body) return '';
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

function renderList() {
  // Deduplicate news items by id in case duplicates were introduced via storage updates
  const seen = new Set();
  const deduped = newsItems.filter(m => {
    if (m && m.id != null && !seen.has(m.id)) { seen.add(m.id); return true; }
    return false;
  });

  // Prefer sorting by numeric id (larger id first). If ids are missing/non-numeric, fall back to date desc.
  deduped.sort((a, b) => {
    const ai = Number(a && a.id);
    const bi = Number(b && b.id);
    if (Number.isFinite(ai) && Number.isFinite(bi)) return bi - ai;
    const pa = parseDateString(a && a.date);
    const pb = parseDateString(b && b.date);
    const da = pa ? pa.date : new Date(0);
    const db = pb ? pb.date : new Date(0);
    return db - da;
  });

  newsList.innerHTML = '';
  deduped.forEach(mail => {
    const masterLogged = localStorage.getItem('masterLoggedIn') === 'true';
    if (mail.id === 5 && !masterLogged) return;
  const item = document.createElement('div');
  item.className = 'news-item';

    const subject = escapeHtml(mail.subject || '');
    const dateStr = escapeHtml(formatListDate(mail.date));
    const previewText = escapeHtml(makePreviewFromBody(mail.body));

    item.innerHTML = `
      <div class="news-meta">
        <span class="news-subject">${subject}</span>
        <span class="news-date">${dateStr}</span>
      </div>
      <div class="news-preview">${previewText}</div>
    `;

    item.onclick = () => {
      try { localStorage.setItem('selectedNews', JSON.stringify(mail)); } catch (e) { console.warn('could not save selectedNews', e); }
      // Navigate to the news detail page (newsbox)
      location.href = 'newsbox/index.html';
    };
    newsList.appendChild(item);
  });
}

window.addEventListener('storage', (ev) => {
  if (!ev.key) return;
  if (ev.key === 'masterLoggedIn') renderList();
  if (ev.key === 'news5') {
    try {
      const newMail = JSON.parse(ev.newValue);
      if (newMail && newMail.id === 5) {
        const idx = newsItems.findIndex(m => m.id === 5);
        if (idx !== -1) newsItems[idx] = newMail;
        else newsItems.unshift(newMail);
        renderList();
      }
    } catch (e) { console.warn('failed to apply news5 from storage event', e); }
  }
  // News does not respond to per-mail read flags.
});

function addNews(mailObj) {
  newsItems.unshift(mailObj);
  renderList();
}

renderList();

function openNews(mail) {
  document.getElementById('popupSubject').textContent = mail.subject;
  document.getElementById('popupDate').textContent = mail.date;
  document.getElementById('popupBody').textContent = mail.body;
  document.getElementById('newsPopup').style.display = 'block';
}

function closePopup() {
  document.getElementById('newsPopup').style.display = 'none';
}

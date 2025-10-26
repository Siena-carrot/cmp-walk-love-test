const userAnswer = localStorage.getItem("obje8Answer");
const loggedIn = localStorage.getItem("adminLoggedIn");

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const normalPhotos = document.getElementById("normalPhotos");
const errorPhotos = document.getElementById("errorPhotos");
const errorDescription = document.getElementById("errorDescription");
const repairYear = document.getElementById("repairYear");
const repairDept = document.getElementById("repairDept");
const repairMessage = document.getElementById("repairMessage");
const container = document.querySelector('.object-container');

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

// 表示ロジック: 回答済み or 修復済みなら正常表示、そうでなければ問題表示
const fixed = localStorage.getItem("obje8Fixed") === "restored";
if (userAnswer || fixed) {
  // 回答済みまたは修復済みなら正常情報を表示
  normalInfo.style.display = "block";
  // hide errorInfo to avoid duplicate headings
  errorInfo.style.display = "none";
  if (normalPhotos) normalPhotos.style.display = "flex";
  if (errorPhotos) errorPhotos.style.display = "none";
  if (container) container.classList.remove('error');
} else {
  // 問題発生時は errorInfo を表示。画像は常時表示なので何も隠さない
  errorInfo.style.display = "block";
  if (normalPhotos) normalPhotos.style.display = "none";
  if (errorPhotos) errorPhotos.style.display = "flex";
  if (container) container.classList.add('error');
}

// If not logged in, disable repair UI and show a short notice/link
if (!loggedIn || loggedIn !== 'true') {
  try {
    const repairSection = document.querySelector('.repair-section');
    if (repairSection && (!userAnswer && !fixed)) {
      // replace repair UI with a notice telling the user to login from the objects list
      const notice = document.createElement('div');
      notice.className = 'repair-locked';
      notice.style.color = '#b00';
      notice.style.fontWeight = '700';
      notice.style.marginTop = '10px';
      notice.innerHTML = '管理者としてログインすると復旧作業が行えます。<br><a href="../index.html">オブジェ一覧に戻る</a>';
      repairSection.parentNode && repairSection.parentNode.replaceChild(notice, repairSection);
    }
  } catch (e) { console.warn('could not apply repair lock notice', e); }
}

// 誤答時のロックは不要なため、関連ロジックは含めていません

function showMap() {
  const map = document.getElementById("mapImage");
  if (map) map.style.display = "block";
}

function showMap(button) {
  try {
    const section = button && button.closest ? button.closest('.map-section') : null;
    // show only the map-specific description (no fallback to page description)
    let desc = '';
    if (section) {
      const mapDesc = section.querySelector('.map-description');
      if (mapDesc && mapDesc.textContent.trim()) desc = mapDesc.textContent.trim();
    }
    let filename = null;
    if (section) {
      const mapImg = section.querySelector('#mapImage img');
      if (mapImg) filename = mapImg.getAttribute('data-filename') || mapImg.getAttribute('src').split('/').pop();
    }
    if (!filename) filename = 'obje8-map.jpg';
    const path = location.pathname.replace(/\\/g, '/');
    const parts = path.split('/');
    const baseParts = parts.slice(0, Math.max(0, parts.length - 3));
    const base = baseParts.join('/') || '';
    const candidate = base + '/assets/maps/' + filename;
    const modal = document.getElementById('mapModal');
    const modalDesc = document.getElementById('mapModalDescription');
    const modalImg = document.getElementById('mapModalImg');
    if (modalDesc) modalDesc.textContent = desc || '';
    if (modalImg) modalImg.src = candidate;
    if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false'); }
  } catch (e) { console.warn('showMap error', e); }
}

function closeMap(){ try { const modal=document.getElementById('mapModal'); if(modal){modal.style.display='none'; modal.setAttribute('aria-hidden','true');}} catch(e){console.warn('closeMap error',e);} }

// 修復処理: 年と学部名の両方が一致すれば説明文を復元する
function attemptRepair() {
  // require admin login to perform repair
  if (!loggedIn || loggedIn !== 'true') {
    if (repairMessage) {
      repairMessage.style.display = 'block';
      repairMessage.style.color = 'red';
      repairMessage.textContent = '管理者としてログインしてください。';
    }
    return;
  }
  let year = repairYear.value && repairYear.value.trim();
  let dept = repairDept.value && repairDept.value.trim();

  if (!year || !dept) {
    repairMessage.style.display = "block";
    repairMessage.style.color = "red";
    repairMessage.textContent = "両方の欄を入力してください。";
    return;
  }

  // 年の全角数字を半角に正規化
  year = year.replace(/[０-９]/g, function(s){
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  // 学部名の余分な空白を削除
  dept = dept.replace(/\s+/g, "");

  // Precomputed SHA-256 hex digests for allowed answers (year||dept)
  const allowedHashes = [
    '215c260ed3f0b128937ecbdc46bc1e0ce2a1a04786e514c93966562b71e1ea7a',
    '4afcc2ab5527fce98842425ddfb0567954119af8efbce40e808ccb53dc51a0d1'
  ];

  const key = `${year}||${dept}`;
  // compare hashed input to allowed list
  sha256Hex(key).then(h => {
    if (allowedHashes.indexOf(h) !== -1) {
      // 修復成功 — mark as restored
      localStorage.setItem("obje8Fixed", "restored");
      // 正しい説明文に置換
      const correctText = "なんとなく素通りしてしまいがちだが、この碑はまさにマチカネワニが発掘された場所にある。発掘されたのは1964年、理学部の校舎建設現場。";
      if (errorDescription) errorDescription.textContent = correctText;
      alert("ページの復旧が確認できました");
      location.reload();
    } else {
      repairMessage.style.display = "block";
      repairMessage.style.color = "red";
      repairMessage.textContent = "エラー発生。もう一度確認してください。";
    }
  }).catch(e => {
    console.error('hash error', e);
    repairMessage.style.display = 'block';
    repairMessage.style.color = 'red';
    repairMessage.textContent = 'エラーが発生しました。';
  });
}
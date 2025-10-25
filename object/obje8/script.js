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

  const okYears = ["1964"];
  const okDepts = ["理学", "阪大理学"];

  if (okYears.includes(year) && okDepts.includes(dept)) {
    // 修復成功 — mark as restored
    localStorage.setItem("obje8Fixed", "restored");
    // 正しい説明文に置換
    const correctText = "なんとなく素通りしてしまいがちだが、この碑はまさにマチカネワニが発掘された場所にある。発掘されたのは1964年、理学部の校舎建設現場。";
    if (errorDescription) errorDescription.textContent = correctText;
    // obje2 と同様の挙動: 成功メッセージを出してページをリロード
    alert("ページの復旧が確認できました");
    location.reload();
  } else {
    repairMessage.style.display = "block";
    repairMessage.style.color = "red";
    repairMessage.textContent = "エラー発生。もう一度確認してください。";
  }
}
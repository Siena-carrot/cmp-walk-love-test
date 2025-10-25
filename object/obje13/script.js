const correctChoice = "c1";
const userAnswer = localStorage.getItem("obje13Answer");
const loggedIn = localStorage.getItem("adminLoggedIn");
const lockUntil = parseInt(localStorage.getItem("obje13LockUntil"), 10);
const now = Date.now();

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const errorView = document.getElementById("errorView");
const normalView = document.getElementById("normalView");
const puzzleBox = document.getElementById("puzzleBox");
const lockMessage = document.getElementById("lockMessage");

// obje13は「正解済み」なら正常表示、それ以外は異常表示
if (userAnswer === correctChoice || userAnswer === 'restored') {
  if (normalInfo) normalInfo.style.display = "block";
  if (normalView) normalView.style.display = "block";
} else {
  if (errorInfo) errorInfo.style.display = "block";
  if (errorView) errorView.style.display = "block";

  if (!isNaN(lockUntil) && now < lockUntil) {
    if (puzzleBox) puzzleBox.style.display = "none";
    if (lockMessage) lockMessage.style.display = "block";
    startLockCountdown(lockUntil);
  }
}

function confirmChoice(choice) {
  const lockUntilLocal = parseInt(localStorage.getItem("obje13LockUntil"), 10);
  if (!isNaN(lockUntilLocal) && Date.now() < lockUntilLocal) {
    alert("現在ロック中です。時間が経過してから再挑戦してください。");
    return;
  }

  const confirmed = confirm("こちらでお間違いないですか？");
  if (confirmed) checkAnswer(choice);
}

function checkAnswer(choice) {
  if (choice === correctChoice) {
    localStorage.setItem("obje13Answer", "restored");
    alert("正解です！ページが復旧しました。");
    location.reload();
  } else {
    const lockTime = Date.now() + 15 * 60 * 1000;
    localStorage.setItem("obje13LockUntil", lockTime);
    alert("誤答がありました。15分後に再挑戦できます。");
    if (puzzleBox) puzzleBox.style.display = "none";
    if (lockMessage) lockMessage.style.display = "block";
    startLockCountdown(lockTime);
  }
}

function startLockCountdown(until) {
  let timer = null;
  function updateCountdown() {
    const nowTime = Date.now();
    const remainingMs = until - nowTime;
    if (remainingMs <= 0) {
      if (timer) clearInterval(timer);
      if (lockMessage) lockMessage.textContent = "ロックが解除されました。再挑戦できます。";
      if (puzzleBox) puzzleBox.style.display = "block";
      return;
    }
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    if (lockMessage) lockMessage.textContent = `誤答のためロック中です。あと ${minutes}分 ${seconds}秒 後に再挑戦できます。`;
  }
  updateCountdown();
  timer = setInterval(updateCountdown, 1000);
}

function showMap() { const map = document.getElementById("mapImage"); if (map) map.style.display = "block"; }

function showMap(button) {
  try {
    const section = button && button.closest ? button.closest('.map-section') : null;
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
    if (!filename) filename = 'obje13-map.jpg';
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
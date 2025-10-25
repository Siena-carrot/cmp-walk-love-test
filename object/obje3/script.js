const correctChoice = "c4";
const userAnswer = localStorage.getItem("obje3Answer");
const loggedIn = localStorage.getItem("adminLoggedIn");
const lockUntil = parseInt(localStorage.getItem("obje3LockUntil"), 10);
const now = Date.now();

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const errorView = document.getElementById("errorView");
const normalView = document.getElementById("normalView");
const puzzleBox = document.getElementById("puzzleBox");
const lockMessage = document.getElementById("lockMessage");

// obje3は「正解済み」なら正常表示、それ以外は異常表示
if (userAnswer === correctChoice || userAnswer === 'restored') {
  normalInfo.style.display = "block";
  normalView.style.display = "block";
} else {
  errorInfo.style.display = "block";
  errorView.style.display = "block";

  if (!isNaN(lockUntil) && now < lockUntil) {
    puzzleBox.style.display = "none";
    lockMessage.style.display = "block";
    startLockCountdown(lockUntil);
  }
}

function confirmChoice(choice) {
  const lockUntil = parseInt(localStorage.getItem("obje3LockUntil"), 10);
  if (!isNaN(lockUntil) && Date.now() < lockUntil) {
    alert("現在ロック中です。時間が経過してから再度検証してください。");
    return;
  }

  const confirmed = confirm("こちらでお間違いないですか？");
  if (confirmed) {
    checkAnswer(choice);
  }
}

function checkAnswer(choice) {
  if (choice === correctChoice) {
  // store a canonical restored marker instead of the raw choice
  localStorage.setItem("obje3Answer", "restored");
    alert("ページの復旧が確認できました");
    location.reload();
  } else {
    const lockTime = Date.now() + 15 * 60 * 1000;
  localStorage.setItem("obje3LockUntil", lockTime);
    alert("エラー発生。15分後に再度検証してください");
    puzzleBox.style.display = "none";
    lockMessage.style.display = "block";
    startLockCountdown(lockTime);
  }
}

function startLockCountdown(until) {
  function updateCountdown() {
    const now = Date.now();
    const remainingMs = until - now;

    if (remainingMs <= 0) {
      clearInterval(timer);
      lockMessage.textContent = "ロックが解除されました。再度検証してください。";
      puzzleBox.style.display = "block";
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    lockMessage.textContent = `ロック中。あと ${minutes}分 ${seconds}秒 お待ちください。`;
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
}

function showMap() {
  const map = document.getElementById("mapImage");
  if (map) map.style.display = "block";
}

// Modal-based showMap/closeMap to match other obje pages
function showMap(button) {
  try {
    const section = button && button.closest ? button.closest('.map-section') : null;
    // Only show .map-description; do not fallback to the object's .description
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
  if (!filename) filename = 'obje3-map.jpg';
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
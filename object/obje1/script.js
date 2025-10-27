const correctChoice = "c1";
const userAnswer = localStorage.getItem("obje1Answer");
const loggedIn = localStorage.getItem("adminLoggedIn");
const lockUntil = parseInt(localStorage.getItem("obje1LockUntil"), 10);
const now = Date.now();

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const errorView = document.getElementById("errorView");
const normalView = document.getElementById("normalView");
const puzzleBox = document.getElementById("puzzleBox");
const lockMessage = document.getElementById("lockMessage");

// 非管理者の場合、表示される h1 タイトルを短縮する
if (loggedIn !== "true") {
  try {
    const errH = errorInfo && errorInfo.querySelector('h1');
    const normH = normalInfo && normalInfo.querySelector('h1');
    if (errH) errH.textContent = '旧制浪速高等学校学生像';
    if (normH) normH.textContent = '旧制浪速高等学校学生像';
  } catch (e) {
    console.error('title shorten error', e);
  }
}

// obje1はログインしていないと異常扱い
if (loggedIn === "true") {
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
  const lockUntil = parseInt(localStorage.getItem("obje1LockUntil"), 10);
  if (!isNaN(lockUntil) && Date.now() < lockUntil) {
    alert("現在ロック中です。時間が経過してから再挑戦してください。");
    return;
  }

  const confirmed = confirm("こちらでお間違いないですか？");
  if (confirmed) {
    checkAnswer(choice);
  }
}

function checkAnswer(choice) {
    if (choice === correctChoice) {
      localStorage.setItem("obje1Answer", "restored");
    alert("正解です！ページが復旧しました。");
    location.reload();
  } else {
    const lockTime = Date.now() + 15 * 60 * 1000;
    localStorage.setItem("obje1LockUntil", lockTime);
    alert("誤答がありました。15分後に再挑戦できます。");
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
      lockMessage.textContent = "ロックが解除されました。再挑戦できます。";
      puzzleBox.style.display = "block";
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    lockMessage.textContent = `誤答のためロック中です。あと ${minutes}分 ${seconds}秒 後に再挑戦できます。`;
  }

  updateCountdown(); // 初回表示
  const timer = setInterval(updateCountdown, 1000);
}

function showMap(button) {
  // Show modal with description and image. Use closest .map-section and surrounding
  // .object-container to find a description. Compute a robust path to assets/maps.
  try {
    const section = button && button.closest ? button.closest('.map-section') : null;
    // Prefer a per-map description (inside .map-section). Fallback to the
    // object's general .description if no map-specific text is provided.
    // Only use a per-map description if present. Do NOT fall back to the
    // object's main `.description` — when absent we should show an empty string.
    let desc = '';
    if (section) {
      const mapDesc = section.querySelector('.map-description');
      if (mapDesc && mapDesc.textContent.trim()) desc = mapDesc.textContent.trim();
    }

    // Determine filename from the img inside this map-section (if present)
    let filename = null;
    if (section) {
      const mapImg = section.querySelector('#mapImage img');
      if (mapImg) {
        filename = mapImg.getAttribute('data-filename') || mapImg.getAttribute('src').split('/').pop();
      }
    }

    // Fallback filename if not found
    if (!filename) filename = 'obje1-map.jpg';

    // Build base path to project root by stripping last 3 segments (e.g. /object/obje1/index.html)
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

    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }
  } catch (e) {
    console.warn('showMap error', e);
  }
}

function closeMap() {
  try {
    const modal = document.getElementById('mapModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  } catch (e) { console.warn('closeMap error', e); }
}
const userAnswer = localStorage.getItem("obje9Answer");
const loggedIn = localStorage.getItem('adminLoggedIn');

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const normalPhotos = document.getElementById("normalPhotos");
const errorPhotos = document.getElementById("errorPhotos");
const errorDescription = document.getElementById("errorDescription");
const repairYear = document.getElementById("repairYear");
const repairDept = document.getElementById("repairDept");
const repairMessage = document.getElementById("repairMessage");

const fixed = localStorage.getItem("obje9Fixed") === "restored";
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
if (userAnswer || fixed) {
  normalInfo.style.display = "block";
  errorInfo.style.display = "none";
  if (normalPhotos) normalPhotos.style.display = "flex";
  if (errorPhotos) errorPhotos.style.display = "none";
  if (container) container.classList.remove('error');
} else {
  errorInfo.style.display = "block";
  if (normalPhotos) normalPhotos.style.display = "none";
  if (errorPhotos) errorPhotos.style.display = "flex";
  if (container) container.classList.add('error');
}

// If not logged in, replace repair UI with a locked notice so repairs can't be attempted
if (!loggedIn || loggedIn !== 'true') {
  try {
    const repairSection = document.querySelector('.repair-section');
    if (repairSection && (!userAnswer && !fixed)) {
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

function showMap(){const map=document.getElementById('mapImage');if(map)map.style.display='block';}

function showMap(button) {
  try {
    const section = button && button.closest ? button.closest('.map-section') : null;
    // Use only .map-description inside the map section; do not fallback to .description
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
    if (!filename) filename = 'obje9-map.jpg';
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

function attemptRepair(){
  // require admin login
  if (!loggedIn || loggedIn !== 'true') {
    if (repairMessage) {
      repairMessage.style.display = 'block';
      repairMessage.style.color = 'red';
      repairMessage.textContent = '管理者としてログインしてください。';
    }
    return;
  }
  let year=repairYear.value&&repairYear.value.trim();
  let dept=repairDept.value&&repairDept.value.trim();
  if(!year||!dept){repairMessage.style.display='block';repairMessage.style.color='red';repairMessage.textContent='両方の欄を入力してください。';return}
  year=year.replace(/[０-９]/g,function(s){return String.fromCharCode(s.charCodeAt(0)-0xFEE0)});
  dept=dept.replace(/\s+/g,'');

  const allowedHashes = ['0c469c6463266d6fec3f4f0b1e3b4b60bd3eb4db07079b6d52b564437af22135'];
  const key = `${year}||${dept}`;
  sha256Hex(key).then(h => {
    if (allowedHashes.indexOf(h) !== -1) {
      localStorage.setItem("obje9Fixed","restored");
      const correctText = "説明文をここに入れてください。";
      if (errorDescription) errorDescription.textContent = correctText;
      alert("ページの復旧が確認できました");
      location.reload();
    } else {
      repairMessage.style.display = 'block';
      repairMessage.style.color = 'red';
      repairMessage.textContent = 'エラー発生。もう一度確認してください。';
    }
  }).catch(e => {
    console.error('hash error', e);
    repairMessage.style.display = 'block';
    repairMessage.style.color = 'red';
    repairMessage.textContent = 'エラーが発生しました。';
  });

}
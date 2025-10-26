const userAnswer = localStorage.getItem("obje11Answer");
const loggedIn = localStorage.getItem('adminLoggedIn');

const errorInfo = document.getElementById("errorInfo");
const normalInfo = document.getElementById("normalInfo");
const normalPhotos = document.getElementById("normalPhotos");
const errorPhotos = document.getElementById("errorPhotos");
const errorDescription = document.getElementById("errorDescription");
const repairYear = document.getElementById("repairYear");
const repairDept = document.getElementById("repairDept");
const repairMessage = document.getElementById("repairMessage");

const fixed = localStorage.getItem("obje11Fixed") === "restored";
if (userAnswer || fixed) {
  normalInfo.style.display = "block";
  errorInfo.style.display = "none";
  if (normalPhotos) normalPhotos.style.display = "flex";
  if (errorPhotos) errorPhotos.style.display = "none";
} else {
  errorInfo.style.display = "block";
  if (normalPhotos) normalPhotos.style.display = "none";
  if (errorPhotos) errorPhotos.style.display = "flex";
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
    // Prefer per-map description only; if missing show empty string
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
    if (!filename) filename = 'obje11-map.jpg';
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

  const allowedHashes = [
    'd44f9b24892eaefeb5e4deab5a41a5bc4bad7ddac2148608d4f4f144e5ec8519',
    'f05e6c9cb519b4ac29c88ba57a1cc5ef8e8276feec00b804523146ea0efb096e',
    '96a21f30cbe2ffa83a948379d2305ead364bbdceedde122de1a9ea5e1679f7cb',
    '812e577ad8bc8d856bf7bee3851c06a492d5d5fbfcab0caecbad656732035663'
  ];
  const key = `${year}||${dept}`;
  sha256Hex(key).then(h => {
    if (allowedHashes.indexOf(h) !== -1) {
      localStorage.setItem("obje11Fixed","restored");
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
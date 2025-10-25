const userAnswer = localStorage.getItem("obje11Answer");

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
  let year=repairYear.value&&repairYear.value.trim();
  let dept=repairDept.value&&repairDept.value.trim();
  if(!year||!dept){repairMessage.style.display='block';repairMessage.style.color='red';repairMessage.textContent='両方の欄を入力してください。';return}
  year=year.replace(/[０-９]/g,function(s){return String.fromCharCode(s.charCodeAt(0)-0xFEE0)});
  dept=dept.replace(/\s+/g,'');
  const okYears=["1986"];const okDepts=["ばら","バラ","薔薇","薔"];
  if(okYears.includes(year)&&okDepts.includes(dept)){localStorage.setItem("obje11Fixed","restored");const correctText="説明文をここに入れてください。";if(errorDescription)errorDescription.textContent=correctText;alert("正解です！ページが復旧しました。");location.reload();}else{repairMessage.style.display='block';repairMessage.style.color='red';repairMessage.textContent='修復キーが違います。もう一度確認してください。'}}
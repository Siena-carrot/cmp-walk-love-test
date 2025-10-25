function showMap(){const map=document.getElementById('mapImage');if(map)map.style.display='block';}

function showMap(button) {
	try {
		const section = button && button.closest ? button.closest('.map-section') : null;
			// Only display the map's .map-description; don't show the page description as fallback
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
		if (!filename) filename = 'obje10-map.jpg';
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
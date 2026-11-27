/* Ezyron · arranque: activa la pantalla de carga antes de pintar (con ?snap se salta, para capturas). */
if(!/[?&]snap/.test(location.search))document.documentElement.classList.add('loading');else document.getElementById('loader').remove();

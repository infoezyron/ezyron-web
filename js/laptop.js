/* Ezyron · escena «Webs» (después de Origen).
 * El punto con el que acaba Origen es el de la tapa de un portátil cerrado visto desde arriba.
 * Al deslizar: la cámara baja, la tapa se abre, la web de muestra baja por la pantalla,
 * un cursor pulsa «Reserva una cita» y la tapa se vuelve a cerrar antes de seguir con la web. */
(() => {
  const sec = document.getElementById('webs'); if (!sec) return;
  const $ = id => document.getElementById(id);
  const pin = $('lp-pin'), lp = $('lp'), lid = $('lp-lid'), view = $('lp-view'), ms = $('ms');
  const shade = $('lp-shade'), cur = $('ms-cursor'), dotEl = $('lp-dot'), glowEl = $('lp-glow'), spill = $('lp-spill');
  const txt = [...pin.querySelectorAll('.lp-txt')];
  const ctaBtn = ms.querySelector('.ms-go'), track = $('ms-track');
  let mqOff = 0; // carrusel infinito de la web de muestra (Custom Spaces, de MotionSites)
  const SNAP = /[?&]snap/.test(location.search);

  /* teclado: filas con teclas de distinto ancho, como uno real */
  const ROWS = [
    { fn: 1, k: Array(14).fill(1) },
    { k: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6] },
    { k: [1.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { k: [1.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75] },
    { k: [2.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.4] },
    { k: [1, 1, 1, 1.25, 5.6, 1.25, 1, 1, 1, 1] }
  ];
  const kb = $('lp-kb');
  ROWS.forEach(r => {
    const row = document.createElement('div'); row.className = 'row' + (r.fn ? ' fn' : '');
    r.k.forEach(w => { const i = document.createElement('i'); i.style.flex = w; row.appendChild(i); });
    kb.appendChild(row);
  });

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const sst = t => t * t * (3 - 2 * t);

  let G = {}, sp = 0;
  function layout() {
    const W = innerWidth, H = pin.clientHeight || innerHeight, mob = W <= 900;
    // la web de muestra se diseña a 960 px (en móvil a 760, en su versión compacta) y se escala a la pantalla
    ms.classList.toggle('sm', mob);
    const lw = mob ? Math.min(W * .9, 520) : Math.min(W * .5, H * .9, 1040);
    const lh = lw * .655, ld = lh, lt = lw * .028, ltt = lw * .012;
    for (const [k, v] of Object.entries({ '--lw': lw, '--lh': lh, '--ld': ld, '--lt': lt, '--ltt': ltt })) lp.style.setProperty(k, v + 'px');
    const hinge = mob ? H * .4 + lh * .42 : H * .5 + lh * .22;
    lp.style.top = (hinge - lh) + 'px';
    const msW = mob ? 760 : 960;
    ms.style.width = msW + 'px';
    const s = view.clientWidth / msW;
    const range = Math.max(0, ms.offsetHeight - view.clientHeight / s);
    const R0 = Math.min(W, H) * .042;
    G = { W, H, mob, lw, lh, ld, hinge, s, range, R0 };
    dotEl.style.width = dotEl.style.height = (R0 * 2) + 'px';
    dotEl.style.margin = `${-R0 - R0 * .25}px 0 0 ${-R0}px`;
  }
  layout();
  addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  function frame() {
    const r = sec.getBoundingClientRect(), vh = innerHeight;
    // hasta que se fija, la escena no se ve: así Origen termina entero y el relevo es en el mismo punto
    pin.style.visibility = r.top > .5 ? 'hidden' : 'visible';
    pin.style.opacity = clamp(-r.top / (vh * .1)).toFixed(3); // relevo suave sobre el final de Origen
    if (r.bottom > 0 && r.top < vh) {
      const p = clamp(-r.top / (r.height - vh));
      sp += (p - sp) * (SNAP ? 1 : .12); sp = clamp(sp, p - .035, p + .035); if (Math.abs(p - sp) < 1e-4) sp = p;

      // 1 · el punto de Origen se posa en la tapa del portátil cerrado (vista cenital)
      const appear = sst(seg(sp, .02, .1));
      // 2 · la cámara baja hasta la vista de tres cuartos
      const tilt = ease(seg(sp, .1, .3));
      // 3 · la tapa se abre · 5 · y se cierra
      const op = ease(seg(sp, .24, .42)), cl = ease(seg(sp, .76, .92));
      const ang = lerp(-90, 12, op * (1 - cl));
      // 4 · la web de muestra baja dentro de la pantalla
      const q = ease(seg(sp, .44, .7));

      // 6 · se guarda: ya cerrado, se pone plano, se centra y baja hasta meterse detrás de la sección clara
      const flat = ease(seg(sp, .88, 1));
      const leave = clamp((-r.top - (r.height - vh)) / vh);
      const scF = G.mob ? .74 : .6;
      const cam = lerp(lerp(90, G.mob ? 20 : 17, tilt), 86, flat);
      const scTD = G.mob ? .78 : .62;
      const sc = lerp(lerp(scTD, 1, tilt), scF, flat);
      const tyTD = (G.H / 2 - G.R0 * .25) - (G.hinge + G.ld / 2 * scTD);
      const tyF = G.H * .5 - (G.hinge + G.ld / 2 * scF);
      const ty = lerp(lerp(tyTD, 0, tilt), tyF, flat) + leave * vh * 1.18;
      const tx = G.mob ? 0 : G.W * .14 * tilt * (1 - flat);
      lp.style.transform = `translateX(${tx.toFixed(1)}px) translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)}) rotateX(${(-cam).toFixed(2)}deg)`;
      lp.style.opacity = appear.toFixed(3);
      lid.style.transform = `translateY(-1px) rotateX(${ang.toFixed(2)}deg)`;

      const lit = op * (1 - cl);
      shade.style.opacity = (1 - lit * .98).toFixed(3);
      spill.style.opacity = lit.toFixed(3);
      glowEl.style.opacity = lit.toFixed(3);

      ms.style.transform = `scale(${G.s}) translateY(${(-q * G.range).toFixed(1)}px)`;
      if (lit > .01) { // el carrusel solo corre con la tapa abierta
        const half = track.scrollWidth / 2;
        mqOff -= .8; if (mqOff <= -half) mqOff += half;
        track.style.transform = `translate3d(${mqOff.toFixed(1)}px,0,0)`;
      }
      const cv = seg(sp, .6, .66) * (1 - seg(sp, .74, .77));
      if (cv > 0) {
        const bx = ctaBtn.offsetLeft + ctaBtn.offsetWidth * .5, by = ctaBtn.offsetTop + ctaBtn.offsetHeight * .6 - q * G.range;
        const k = ease(seg(sp, .6, .7));
        const x = lerp(view.clientWidth * .85, bx * G.s, k), y = lerp(view.clientHeight * .96, by * G.s, k);
        const press = seg(sp, .7, .715) * (1 - seg(sp, .715, .73));
        cur.style.opacity = cv.toFixed(3);
        cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${((G.mob ? .8 : 1) * (1 - press * .25)).toFixed(3)})`;
        ctaBtn.style.transform = `scale(${(1 - press * .06).toFixed(3)})`;
        ctaBtn.classList.toggle('on', k > .9);
      } else cur.style.opacity = 0;

      // el punto suelto se encoge hasta el de la tapa y desaparece
      const backD = G.lw * .06 * scTD / (G.R0 * 2);
      dotEl.style.transform = `scale(${lerp(1, backD, sst(seg(sp, 0, .1))).toFixed(3)})`;
      dotEl.style.opacity = (1 - sst(seg(sp, .08, .13))).toFixed(3);

      // textos: mientras la tapa está abierta
      const to = sst(seg(sp, .36, .46)) * (1 - sst(seg(sp, .74, .8)));
      txt.forEach(el => { el.style.opacity = to.toFixed(3); el.style.transform = `translateY(${((1 - to) * 18).toFixed(1)}px)`; el.style.visibility = to < .01 ? 'hidden' : 'visible'; });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

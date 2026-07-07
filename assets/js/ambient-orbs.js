document.addEventListener('DOMContentLoaded', function () {
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  var hosts = Array.prototype.slice.call(document.querySelectorAll('.bg-network-light'));
  if (!hosts.length || typeof HTMLCanvasElement === 'undefined') return;

  hosts.forEach(setupOrbs);

  function setupOrbs(host) {
    var canvas = document.createElement('canvas');
    canvas.className = 'ambient-orbs-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0, orbs = [];
    var mouse = { x: 0, y: 0, active: false };
    var running = true;
    var frameId = null;
    var t = 0;

    var COLORS = ['0,179,179', '107,79,216'];

    function resize() {
      var rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var minSpan = Math.min(width, height);
      var count = Math.max(3, Math.min(5, Math.round((width * height) / 90000)));
      orbs = [];
      for (var i = 0; i < count; i++) {
        var r = minSpan * (0.09 + Math.random() * 0.08);
        orbs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          r: r,
          baseR: r,
          c: COLORS[i % COLORS.length],
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function step() {
      if (!running) { frameId = null; return; }
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < orbs.length; i++) {
        var o = orbs[i];

        if (mouse.active) {
          var dx = o.x - mouse.x, dy = o.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var influence = o.r + 260;
          if (dist < influence && dist > 0.1) {
            var push = (1 - dist / influence) * 0.16;
            o.vx += (dx / dist) * push;
            o.vy += (dy / dist) * push;
          }
        }

        var speed = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
        var maxSpeed = 2.2;
        if (speed > maxSpeed) {
          o.vx = (o.vx / speed) * maxSpeed;
          o.vy = (o.vy / speed) * maxSpeed;
        }

        o.x += o.vx;
        o.y += o.vy;
        o.vx *= 0.94;
        o.vy *= 0.94;

        var margin = o.r * 0.6;
        if (o.x < -margin) o.x = width + margin;
        if (o.x > width + margin) o.x = -margin;
        if (o.y < -margin) o.y = height + margin;
        if (o.y > height + margin) o.y = -margin;

        // gentle breathing pulse for a calm, "alive" feel
        o.r = o.baseR * (1 + Math.sin(t + o.phase) * 0.06);
      }

      // faint threads between orbs that drift close to each other
      ctx.lineWidth = 1;
      for (var a = 0; a < orbs.length; a++) {
        for (var b = a + 1; b < orbs.length; b++) {
          var oa = orbs[a], ob = orbs[b];
          var ldx = oa.x - ob.x, ldy = oa.y - ob.y;
          var ldist = Math.sqrt(ldx * ldx + ldy * ldy);
          var threshold = oa.r + ob.r + 90;
          if (ldist < threshold) {
            var strength = (1 - ldist / threshold) * 0.12;
            var lineGrad = ctx.createLinearGradient(oa.x, oa.y, ob.x, ob.y);
            lineGrad.addColorStop(0, 'rgba(' + oa.c + ',' + strength + ')');
            lineGrad.addColorStop(1, 'rgba(' + ob.c + ',' + strength + ')');
            ctx.strokeStyle = lineGrad;
            ctx.beginPath();
            ctx.moveTo(oa.x, oa.y);
            ctx.lineTo(ob.x, ob.y);
            ctx.stroke();
          }
        }
      }

      // soft, additive glow so overlapping orbs blend into one another
      ctx.globalCompositeOperation = 'lighter';
      for (var k = 0; k < orbs.length; k++) {
        var ok = orbs[k];
        var gradient = ctx.createRadialGradient(ok.x, ok.y, 0, ok.x, ok.y, ok.r);
        gradient.addColorStop(0, 'rgba(' + ok.c + ',0.16)');
        gradient.addColorStop(0.6, 'rgba(' + ok.c + ',0.07)');
        gradient.addColorStop(1, 'rgba(' + ok.c + ',0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ok.x, ok.y, ok.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      frameId = requestAnimationFrame(step);
    }

    function handleMove(e) {
      var rect = host.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    resize();
    frameId = requestAnimationFrame(step);

    window.addEventListener('resize', resize);
    host.addEventListener('mousemove', handleMove);
    host.addEventListener('mouseleave', function () { mouse.active = false; });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && frameId === null) {
        frameId = requestAnimationFrame(step);
      }
    });
  }
});

(function() {
            var M = Matter;
            var container = document.getElementById('stickersContainer');
            var stickerFiles = ['https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/1.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/2.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/3.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/4.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/5.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/6.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/7.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/8.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/9.svg','https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/10.svg'];
            var count = 10;
            var isActive = false;
            var stickerData = [];
            var bodies = [];

            var engine = M.Engine.create({ gravity: { x: 0, y: 1 }, enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
            var world = engine.world;

            var wallOpts = { isStatic: true, restitution: 0, friction: 1 };
            var walls = {};

            function createWalls() {
                var W = window.innerWidth, H = window.innerHeight;
                var t = 60;
                if (walls.left) { M.World.remove(world, walls.left); }
                if (walls.right) { M.World.remove(world, walls.right); }
                if (walls.bottom) { M.World.remove(world, walls.bottom); }
                walls.left = M.Bodies.rectangle(-t / 2, H / 2, t, H * 4, wallOpts);
                walls.right = M.Bodies.rectangle(W + t / 2, H / 2, t, H * 4, wallOpts);
                walls.bottom = M.Bodies.rectangle(W / 2, H + t / 2, W * 2, t, wallOpts);
                M.World.add(world, [walls.left, walls.right, walls.bottom]);
            }

            function getBaseSize(fn) {
                return fn === 'https://cdn.jsdelivr.net/gh/tuntungua96-create/-2@388c28c0212d23561ec2dae25274c5e0776d137c/cdn-assets-part1/关于我/贴纸/10.svg' ? 300 : 100;
            }

            for (var i = 0; i < count; i++) {
                var fn = stickerFiles[i % stickerFiles.length];
                var bs = getBaseSize(fn);
                var el = document.createElement('img');
                el.className = 'sticker';
                el.src = fn;
                el.draggable = false;
                el.style.width = bs + 'px';
                el.style.height = bs + 'px';
                el.style.objectFit = 'fill';
                el.style.position = 'absolute';
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';
                el.style.willChange = 'transform';
                el.style.display = 'none';
                container.appendChild(el);

                var body = M.Bodies.rectangle(0, 0, bs, bs, {
                    restitution: 0,
                    friction: 0.5,
                    frictionAir: 0.015,
                    density: 0.002
                });
                body.isSticker = true;
                body.stickerIdx = i;

                var sd = { el: el, body: body, active: false, width: bs, height: bs };
                stickerData.push(sd);
                bodies.push(body);

                (function(idx, imgEl, baseSize, body) {
                    imgEl.onload = function() {
                        var nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
                        if (nw > 0 && nh > 0) {
                            var scale = Math.min(baseSize / nw, baseSize / nh);
                            var dw = nw * scale, dh = nh * scale;
                            imgEl.style.width = dw + 'px';
                            imgEl.style.height = dh + 'px';
                            stickerData[idx].width = dw;
                            stickerData[idx].height = dh;
                            var px = body.position.x, py = body.position.y;
                            var vx = body.velocity.x, vy = body.velocity.y;
                            M.Body.scale(body, dw / baseSize, dh / baseSize);
                            M.Body.setPosition(body, { x: px, y: py });
                            M.Body.setVelocity(body, { x: vx, y: vy });
                        }
                    };
                    if (imgEl.complete && imgEl.naturalWidth > 0) {
                        imgEl.onload();
                    }
                })(i, el, bs, body);
            }

            var dragBody = null;
            var dragConstraint = null;

            document.addEventListener('pointerdown', function(e) {
                if (!isActive || (e.button !== undefined && e.button !== 0)) return;
                var pos = { x: e.clientX, y: e.clientY };
                var found = M.Query.point(bodies, pos);
                if (found.length > 0) {
                    e.preventDefault();
                    dragBody = found[0];
                    dragConstraint = M.Constraint.create({
                        pointA: { x: pos.x, y: pos.y },
                        bodyB: dragBody,
                        pointB: { x: 0, y: 0 },
                        stiffness: 0.8,
                        length: 0
                    });
                    M.World.add(world, dragConstraint);
                }
            });

            document.addEventListener('pointermove', function(e) {
                if (dragConstraint) {
                    e.preventDefault();
                    dragConstraint.pointA.x = e.clientX;
                    dragConstraint.pointA.y = Math.min(e.clientY, window.innerHeight - 40);
                }
            }, { passive: false });

            function endDrag() {
                if (dragConstraint) {
                    M.World.remove(world, dragConstraint);
                    dragConstraint = null;
                    dragBody = null;
                }
            }
            document.addEventListener('pointerup', endDrag);
            document.addEventListener('pointercancel', endDrag);

            container.addEventListener('contextmenu', function(e) { e.preventDefault(); });

            var syncId = null;
            var lastTime = 0;

            function syncLoop(time) {
                if (!isActive) return;
                var delta = lastTime ? Math.min(time - lastTime, 33.33) : 16.67;
                lastTime = time;
                M.Engine.update(engine, delta);
                for (var i = 0; i < count; i++) {
                    var sd = stickerData[i];
                    if (!sd.active) continue;
                    var b = sd.body;
                    if (b && b.position) {
                        sd.el.style.left = b.position.x + 'px';
                        sd.el.style.top = b.position.y + 'px';
                        sd.el.style.transform = 'translate(-50%, -50%) rotate(' + b.angle + 'rad)';
                        sd.el.style.zIndex = Math.max(1, Math.round(b.position.y));
                    }
                }
                syncId = requestAnimationFrame(syncLoop);
            }

            function startPhysics() {
                if (isActive) return;
                isActive = true;
                lastTime = 0;
                createWalls();
                M.World.add(world, bodies);
                var W = window.innerWidth, H = window.innerHeight;
                for (var i = 0; i < count; i++) {
                    var sd = stickerData[i];
                    var body = sd.body;
                    var margin = Math.min(W / 2 - 10, (sd.width || 100) / 2 + 10);
                    var x = margin + Math.random() * Math.max(1, W - margin * 2);
                    var y = -(sd.height || 100) - Math.random() * 240;
                    M.Body.setPosition(body, { x: x, y: y });
                    M.Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 2 + Math.random() * 2 });
                    M.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
                    if (M.Sleeping) { M.Sleeping.set(body, false); }
                    sd.el.style.display = 'block';
                    sd.el.style.opacity = '1';
                    sd.el.style.transition = 'none';
                    sd.active = true;
                }
                syncLoop(performance.now());
            }

            function stopPhysics() {
                isActive = false;
                if (syncId) { cancelAnimationFrame(syncId); syncId = null; }
                lastTime = 0;
                if (dragConstraint) { M.World.remove(world, dragConstraint); dragConstraint = null; dragBody = null; }
                for (var b = 0; b < bodies.length; b++) {
                    M.World.remove(world, bodies[b]);
                }
                if (walls.left) { M.World.remove(world, walls.left); }
                if (walls.right) { M.World.remove(world, walls.right); }
                if (walls.bottom) { M.World.remove(world, walls.bottom); }
                walls = {};
                for (var i = 0; i < count; i++) {
                    stickerData[i].active = false;
                    stickerData[i].el.style.display = 'none';
                }
            }

            window.addEventListener('resize', function() {
                if (isActive) createWalls();
            });

            for (var i = 0; i < count; i++) {
                stickerData[i].el.style.display = 'none';
            }

            var MAX_DEG = 720, PUSH_START = MAX_DEG / 2, TRIGGER_DEG = 13;
            var wasShown = false;
            var textFaded = false;
            var revealTargets = document.querySelectorAll('.info-text, .info-label, .info-meta, .info-sub');
            revealTargets.forEach(function(el, groupIndex) {
                var text = el.textContent;
                el.setAttribute('aria-label', text);
                el.style.setProperty('--group-delay', (groupIndex % 4) * 30 + 'ms');
                el.textContent = '';
                Array.from(text).forEach(function(char, charIndex) {
                    if (/\s/.test(char)) {
                        el.appendChild(document.createTextNode(char));
                        return;
                    }
                    var mask = document.createElement('span');
                    var inner = document.createElement('span');
                    mask.className = 'reveal-mask';
                    mask.setAttribute('aria-hidden', 'true');
                    inner.className = 'reveal-char';
                    inner.style.setProperty('--char-index', charIndex);
                    inner.textContent = char;
                    mask.appendChild(inner);
                    el.appendChild(mask);
                });
            });
            window.addEventListener('scroll', function() {
                var scrollY = window.scrollY;
                var maxScroll = document.body.scrollHeight - window.innerHeight;
                var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
                progress = Math.min(1, Math.max(0, progress));
                var linearDeg = progress * MAX_DEG;
                var t = Math.min(1, linearDeg / PUSH_START);
                var rotatedDeg = t * TRIGGER_DEG;
                if (!textFaded && rotatedDeg >= TRIGGER_DEG - 0.5) {
                    textFaded = true;
                    revealTargets.forEach(function(el) {
                        el.classList.add('text-revealed');
                    });
                }
            }, { passive: true });

            window.addEventListener('scroll', function() {
                var scrollY = window.scrollY;
                var maxScroll = document.body.scrollHeight - window.innerHeight;
                var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
                progress = Math.min(1, Math.max(0, progress));
                var linearDeg = progress * MAX_DEG;
                var t = Math.min(1, linearDeg / PUSH_START);
                var rotatedDeg = t * TRIGGER_DEG;
                var shouldShow = rotatedDeg >= TRIGGER_DEG - 0.5;
                if (shouldShow && !wasShown) {
                    startPhysics();
                    wasShown = true;
                    clearTimeout(window._stickerTimer);
                    window._stickerTimer = setTimeout(function() {
                        stopPhysics();
                        wasShown = false;
                    }, 300000);
                }
            }, { passive: true });
        })();
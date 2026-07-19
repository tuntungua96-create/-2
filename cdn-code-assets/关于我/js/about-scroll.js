(function() {
            var screens = document.querySelectorAll('.screen');
            var total = screens.length;
            var scrollHeight;

            function setHeight() {
                scrollHeight = window.innerHeight * 3;
                document.body.style.height = scrollHeight + 'px';
            }

            var MAX_DEG = 720;
            var TRIGGER_DEG = 13;
            var PUSH_START = MAX_DEG / 2;

            function calculateFoldedDeg(linearDeg) {
                var t = Math.min(1, linearDeg / PUSH_START);
                return t * TRIGGER_DEG;
            }

            function apply(linearDeg, rotatedDeg) {
                var el = screens[0];
                if (!el) return;
                var t = Math.min(1, linearDeg / MAX_DEG);
                el.style.zIndex = 10;
                el.style.transform = 'translate(' + (-t * 50) + 'px,0px) rotate(' + (-rotatedDeg) + 'deg)';
                var container = document.querySelector('.screens-fixed');
                var pushProgress = Math.max(0, Math.min(1, (linearDeg - PUSH_START) / (MAX_DEG - PUSH_START)));
                container.style.transform = 'translateY(' + (-pushProgress * 20) + 'vh)';
            }

            setHeight();
            apply(0, 0);

            window.addEventListener('scroll', function() {
                var scrollY = window.scrollY;
                var maxScroll = scrollHeight - window.innerHeight;
                var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
                progress = Math.min(1, Math.max(0, progress));
                var linearDeg = progress * MAX_DEG;
                var finalDeg = calculateFoldedDeg(linearDeg);
                apply(linearDeg, finalDeg);
            }, { passive: true });

            window.addEventListener('resize', function() {
                setHeight();
            });
        })();
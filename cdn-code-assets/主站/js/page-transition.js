// 页面过渡动画
        const pt = document.getElementById('pageTransition');
        const pageEntryState = window.__pageEntryState || {};
        const cameFromTransition = pageEntryState.fromTransition === true;
        const isTransitionPreview = pageEntryState.transitionPreview === true;
        if (cameFromTransition) {
            const cleanEntryUrl = new URL(location.href);
            cleanEntryUrl.searchParams.delete('fromTransition');
            history.replaceState(null, '', cleanEntryUrl.pathname + cleanEntryUrl.search + cleanEntryUrl.hash);
        }

        let isTransitioning = false;
        const targetBackground = (url) => {
            let path = url.pathname;
            try { path = decodeURIComponent(path); } catch (error) {}
            if (path.includes('/关于我/')) return '#FFFEF8';
            if (path.includes('/我的项目/')) return '#f3f3f3';
            return '#000';
        };
        const setInitialCardTransform = () => {
            const mobile = window.innerWidth <= 768;
            const width = mobile
                ? Math.max(1, window.innerWidth - 16) * .7
                : Math.min(1024, Math.max(1, window.innerWidth - 40)) * 1.05;
            const height = mobile
                ? Math.max(1, window.innerHeight * .7) * .7
                : Math.min(640, Math.max(1, window.innerHeight - 40)) * 1.05;
            pt.style.setProperty('--card-scale-x', String(width / Math.max(1, window.innerWidth)));
            pt.style.setProperty('--card-scale-y', String(height / Math.max(1, window.innerHeight)));
        };
        const makeTransitionFrame = (href) => {
            const preview = document.createElement('iframe');
            preview.className = 'page-transition-preview';
            preview.setAttribute('aria-hidden', 'true');
            preview.tabIndex = -1;
            preview.loading = 'eager';
            const previewUrl = new URL(href, window.location.href);
            previewUrl.searchParams.delete('fromTransition');
            previewUrl.searchParams.set('transitionPreview', '1');
            const ready = new Promise(resolve => {
                preview.addEventListener('load', () => {
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        preview.classList.add('ready');
                        resolve(true);
                    }));
                }, { once: true });
                preview.addEventListener('error', () => resolve(false), { once: true });
            });
            preview.src = previewUrl.href;
            return { preview, ready };
        };
        const buildTransitionPreview = (href) => {
            pt.innerHTML = '';
            const { preview, ready } = makeTransitionFrame(href);
            pt.appendChild(preview);
            return ready;
        };

        const prefetchTargets = () => {
            if (window.self !== window.top || isTransitionPreview) return;
            const existing = new Set(Array.from(document.querySelectorAll('link[rel="prefetch"]')).map(link => link.href));
            document.querySelectorAll('[data-link]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#')) return;
                const url = new URL(href, location.href);
                url.searchParams.delete('fromTransition');
                url.searchParams.delete('transitionPreview');
                if (url.pathname === location.pathname || existing.has(url.href)) return;
                const hint = document.createElement('link');
                hint.rel = 'prefetch';
                hint.href = url.href;
                document.head.appendChild(hint);
                existing.add(url.href);
            });
        };
        if (window.self === window.top && !isTransitionPreview) {
            if ('requestIdleCallback' in window) requestIdleCallback(prefetchTargets, { timeout: 1500 });
            else setTimeout(prefetchTargets, 900);
        }

        const resetPageTransition = () => {
            isTransitioning = false;
            document.documentElement.classList.remove('is-page-leaving');
            document.documentElement.removeAttribute('aria-busy');
            pt.classList.remove('is-active');
            pt.classList.add('fade-in');
            pt.style.display = '';
            pt.style.removeProperty('--card-scale-x');
            pt.style.removeProperty('--card-scale-y');
            pt.style.removeProperty('--transition-target-bg');
            pt.innerHTML = '';
        };
        window.addEventListener('pageshow', event => {
            if (event.persisted || pt.classList.contains('is-active')) resetPageTransition();
        });

        document.querySelectorAll('[data-link]').forEach(a => {
            a.addEventListener('click', e => {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('#') || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                const linkUrl = new URL(href, window.location.href);
                if (linkUrl.pathname === window.location.pathname && linkUrl.search === window.location.search) return;
                if (isTransitioning) return;
                isTransitioning = true;
                document.documentElement.classList.add('is-page-leaving');
                document.documentElement.setAttribute('aria-busy', 'true');
                const bgMusic = document.getElementById('bgMusic');
                if (bgMusic && !bgMusic.paused) bgMusic.pause();
                setInitialCardTransform();
                pt.style.setProperty('--transition-target-bg', targetBackground(linkUrl));
                const previewReady = buildTransitionPreview(href);
                pt.style.display = 'block';
                pt.classList.remove('fade-in');
                const overlayDone = new Promise(resolve => {
                    let settled = false;
                    const finish = () => {
                        if (settled) return;
                        settled = true;
                        pt.removeEventListener('transitionend', onEnd);
                        resolve();
                    };
                    const onEnd = event => {
                        if (event.target === pt && event.propertyName === 'transform') finish();
                    };
                    pt.addEventListener('transitionend', onEnd);
                    setTimeout(finish, 900);
                });
                requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.add('is-active')));
                const previewGate = Promise.race([
                    previewReady,
                    new Promise(resolve => setTimeout(() => resolve(false), 1800))
                ]);
                Promise.all([overlayDone, previewGate]).then(() => {
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        const nextUrl = new URL(href, window.location.href);
                        nextUrl.searchParams.delete('transitionPreview');
                        nextUrl.searchParams.set('fromTransition', '1');
                        window.location.assign(nextUrl.href);
                    }));
                });
            });
        });
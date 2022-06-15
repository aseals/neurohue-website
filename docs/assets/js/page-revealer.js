{
    const easing = 'cubic-bezier(0.8, 0, 0.2, 1)';
    const duration = 1.1; // seconds
    {
        const style = document.createElement('style');
        style.append(`
            .page-revealer {
                pointer-events: none;
                visibility: hidden;
                height: 100%;
                width: 100%;
                position: fixed;
                right: 0;
                bottom: 0;
                left: 0;
                transform: scaleY(0);
                z-index: 12000;
                background-color: #090909;
            }
        `);
        document.head.append(style);
    }

    const revealer = document.createElement('div');
    revealer.classList.add('page-revealer');
    document.documentElement.append(revealer);

    (
        // document.referrer.startsWith(location.origin + '/') ||
        localStorage.getItem('page-revealer') === 'show'
    ) && (async () => {
        localStorage.removeItem('page-revealer');
        revealer.style.transition = '';
        revealer.style.visibility = 'visible';
        revealer.style.transform = 'scaleY(1)';
        revealer.style.transformOrigin = 'center bottom';
        await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await new Promise(r => requestAnimationFrame(r));
        revealer.style.transition = 'transform ' + duration + 's ' + easing;
        revealer.style.transform = 'scaleY(0)';
        revealer.style.transformOrigin = 'center top';
        await new Promise(r => setTimeout(r, duration * 1100));
        revealer.style.visibility = '';
        revealer.style.transform = '';
        revealer.style.transformOrigin = '';
    })();
    /**
     *
     * @param {HTMLAnchorElement} anchor
     */
    const shouldShowRevealer = anchor => {
        const isHTTP = anchor.protocol === 'http:' || anchor.protocol === 'https:';
        // revealer works only on http protocols
        if (!isHTTP) return false;
        const isSameOrigin = location.protocol === anchor.protocol && location.origin === anchor.origin;
        // revealer works only when navigating to the same domain
        if (!isSameOrigin) return false;
        const isSamePage = location.pathname === anchor.pathname && location.search === anchor.search;
        const hasHash = anchor.hash || anchor.href !== anchor.origin + anchor.pathname + anchor.search + anchor.hash;
        // revealer works when changing page
        if (!isSamePage) return true;
        // revealer don't work when anchor has hash
        if (hasHash) return false;
        return true;
    };
    document.addEventListener('click', async e => {
        /** @type {HTMLElement} */
        // @ts-ignore
        const el = e.target;
        const anchor = el.closest('a');
        if (anchor && anchor instanceof HTMLAnchorElement && shouldShowRevealer(anchor)) {
            e.preventDefault();
            revealer.style.transition = 'transform ' + duration + 's ' + easing;
            revealer.style.visibility = 'visible';
            revealer.style.transform = 'scaleY(1)';
            revealer.style.transformOrigin = 'center bottom';
            await new Promise(r => setTimeout(r, duration * 1100));
            localStorage.setItem('page-revealer', 'show');
            location.href = anchor.href;
        }
    });
}
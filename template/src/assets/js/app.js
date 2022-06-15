// @ts-check
/// <reference types="jquery"/>
/// <reference types="uikit"/>
/// <reference types="feather-icons"/>
/// <reference types="animejs"/>
/// <reference path="./globals.d.ts"/>
/// <reference path="./app-head.js"/>

// Scrollbar width
{
    const updateScrollWidth = () => {
        document.documentElement.style.setProperty('--body-scroll-width', (window.innerWidth - document.documentElement.clientWidth) + 'px');
    };
    window.addEventListener('resize', updateScrollWidth);
    updateScrollWidth();
}

// Initiat Feather Icons
feather.replace({ class: 'icon' });

// Viewport Dark
{
    const $window = $(window);
    /**
     * Returns in percentages how much can be seen vertically
     * of an element in the current viewport.
     * @see https://stackoverflow.com/questions/33859522/how-much-of-an-element-is-visible-in-viewport
     *
     * @param {JQuery} el
     */
    const visibleRatio = el => {
        const winHeight = $window.height() || 0;
        const elHeight = el.height() || 0;
        const eTop = (el.offset() || { top: 0 }).top;
        const eBottom = eTop + elHeight;
        const wTop = $window.scrollTop() || 0;
        const wBottom = wTop + winHeight;
        const totalH = Math.max(eBottom, wBottom) - Math.min(eTop, wTop);
        const wComp = totalH - winHeight;
        const eIn = elHeight - wComp;
        return eIn <= 0 ? 0 : eIn / elHeight;
    };
    const defaultRatio = 0.25;
    const items = $('[data-viewport-dark]').toArray().map(item => ({
        ratio: parseFloat(item.getAttribute('data-viewport-dark') || '') || defaultRatio,
        $el: $(item)
    }));
    if (items.length) {
        const handler = () => {
            const enableDark = items.some(item => visibleRatio(item.$el) > item.ratio);
            setDarkMode(enableDark);
        };
        $window.on('scroll resize load', handler);
        handler();
    }
}




// Custom Dropdown list
{
    class DropDown {
        /**
         *
         * @param {JQuery} el
         */
        constructor(el) {
            this.dd = el;
            this.placeholder = this.dd.find('span');
            this.opts = this.dd.find('.uk-droplist-dropdown li');
            this.val = '';
            this.index = -1;
            this.initEvents();
            this.onChangeHandlers = new Set();
        }
        initEvents() {
            const obj = this;
            obj.dd.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).toggleClass('uk-active');
            });
            obj.opts.on('click', function () {
                const opt = $(this);
                obj.val = opt.text();
                obj.index = opt.index();
                obj.placeholder.text(obj.val);
                opt.siblings().removeClass('uk-active');
                opt.filter(':contains("' + obj.val + '")').addClass('uk-active');
                obj.dd.trigger('change');
            }).trigger('change');
            $(document).on('click', function () {
                // close menu on document click
                obj.dd.removeClass('uk-active');
            });
        }
        get options() {
            return this.opts;
        }
        get value() {
            return this.val;
        }
        get selectedIndex() {
            return this.index;
        }
    }
    $(function () {
        document.querySelectorAll('.uk-droplist').forEach((el) => {
            // create new variable for each menu
            // @ts-ignore
            const dd1 = new DropDown($(el));
            if (el.classList.contains('uk-droplist-filter')) {
                dd1.dd.on('change', () => {
                    const option = dd1.options[dd1.selectedIndex];
                    // @ts-ignore
                    UIkit.filter(dd1.dd.closest('[data-uk-filter]')).apply(option);
                });
            }
        });
    });
}

// Nav Menu Bound
{
    const ulList = [...document.querySelectorAll('.uk-navbar-nav ul')];
    const update = () => {
        if (!ulList[0] || !ulList[0]['offsetParent']) return;
        const documentWidth = document.documentElement.clientWidth;
        ulList.forEach(ul => {
            ul.classList.remove('reverse-submenu-open');
            const rect = ul.getBoundingClientRect();
            if (rect.right > documentWidth) {
                ul.classList.add('reverse-submenu-open');
            }
        });
    };
    window.addEventListener('load', update);
    window.addEventListener('resize', update);
    setInterval(update, 1000);
}

// Image revealer on text hover
{
    const items = document.querySelectorAll('[data-image-hover-revealer]');
    if (items.length) {
        const scrollBarWidth = 17;
        const duration = 400;
        const overflowFlip = true;

        const image = document.createElement('img');
        image.alt = '';
        image.className = 'image-hover-revealer';
        document.body.append(image);

        /** @type {number} */
        let startTime;
        let timeoutId;
        let isActive = false;

        items.forEach((el) => {
            if (!(el instanceof HTMLElement)) return;
            if (!(image instanceof Image)) return;
            const imageData = el.getAttribute('data-image-hover-revealer');

            el.addEventListener('mouseover', () => {
                image.setAttribute('src', imageData);
                image.classList.add('uk-active');
                startTime = Date.now();
                isActive = true;
                clearTimeout(timeoutId);
            });
            window.addEventListener('mousemove', (e) => {
                if (!isActive) return;
                let x = e.pageX;
                let y = e.pageY;
                const width = image.clientWidth;
                const height = image.clientHeight;
                if (x + width >= window.scrollX + window.innerWidth - scrollBarWidth) {
                    if (overflowFlip) x -= width;
                    else x = window.innerWidth - scrollBarWidth - width;
                }
                if (y + height >= window.scrollY + window.innerHeight) {
                    if (overflowFlip) y -= height;
                    else y = window.scrollY + window.innerHeight - height;
                }
                image.style.setProperty('--move-x', x + 'px');
                image.style.setProperty('--move-y', y + 'px');
            });
            el.addEventListener('mouseleave', () => {
                const dt = Date.now() - startTime;
                timeoutId = setTimeout(() => {
                    image.classList.remove('uk-active');
                    timeoutId = setTimeout(() => {
                        isActive = false;
                        image.style.setProperty('--move-x', '0px');
                        image.style.setProperty('--move-y', '0px');
                    }, duration);
                }, Math.max(0, duration - dt));
            });
        });
    }
}

// Sticky item contrast
/**
 *
 * @param {HTMLElement[]} sections
 * @param {HTMLElement} item
 * @param {number | ((element: HTMLElement) => number)} offset
 * @param {{ black?: string, white?: string }} colorMap
 */
const stickyItemContrast = (sections, item, offset, colorMap = {}) => {
    // https://codepen.io/gkobilansky/pen/JEpWoZ

    colorMap = Object.assign({
        black: 'contrast-black',
        white: 'contrast-white',
    }, colorMap);

    /**
     * @template T, V
     * @param {(n: T) => V} fun
     */
    const memoizer = fun => {
        // @ts-ignore
        /** @type {Record<T, V>} */
        // @ts-ignore
        const cache = {};
        /** @param {T} n */
        return n => {
            if (cache[n] != undefined ) {
                return cache[n];
            } else {
                const result = fun(n)
                cache[n] = result;
                return result;
            }
        };
    };

    /**
     * https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
     *
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
    function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow( (v + 0.055) / 1.055, 2.4 );
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    /**
     *
     * @param {number[]} rgb1
     * @param {number[]} rgb2
     */
    function contrast(rgb1, rgb2) {
        const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
        const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05)
            / (darkest + 0.05);
    }

    // Color contrast helper function
    // https://en.wikipedia.org/wiki/YIQ
    /** @param {string} rgbColor */
    const getContrastYIQ = rgbColor => {
        // default contrast when background color is rgba
        if (!rgbColor.startsWith('rgb(')) return 'black';
        const rgb = rgbColor.slice(4, -1).split(',').map(Number);

        // test contrast on black and white
        // return contrast(rgb, [0, 0, 0]) > contrast(rgb, [255, 255, 255]) ? 'black' : 'white';

        const yiq = ((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    };

    const getContrastYIQMemo = memoizer(getContrastYIQ);

    /**
     * @param {Element} section
     */
    const getSectionBackgroundColor = section => {
        let backgroundColor = '';
        while (section) {
            backgroundColor = window.getComputedStyle(section, null).getPropertyValue('background-color');
            if (!/rgba\(.*?,\s*0\)$/.test(backgroundColor)) break;
            section = section.parentElement;
        }
        return backgroundColor;
    };

    const $window = $(window);
    let previousTextColor = '';
    const handler = () => {
        const offsetValue = typeof offset === 'function' ? offset(item) : offset;
        const sectionIndex = sections.map(section => {
            if (!(section instanceof HTMLElement)) return false;
            return window.scrollY + offsetValue >= section.offsetTop;
        }).lastIndexOf(true);

        if (sectionIndex === -1) return;

        const section = sections[sectionIndex];
        const backgroundColor = getSectionBackgroundColor(section);
        const textColor = getContrastYIQMemo(backgroundColor);

        if (previousTextColor !== textColor && colorMap[previousTextColor]) {
            item.classList.remove(colorMap[previousTextColor]);
        }
        if (colorMap[textColor]) {
            item.classList.add(colorMap[textColor]);
        }
        previousTextColor = textColor;
    };
    $window.on('scroll resize load darkmodechange', handler);
    handler();
};

/**
 *
 * @param {Element} elem
 */
const getElementParents = (elem) => {
    /** @type {Element[]} */
    const parents = [];
    // @ts-ignore
    while(elem = elem.parentNode) {
        parents.push(elem);
    }
    return parents;
};

/**
 * @param {string} selector
 * @param {number | ((element: HTMLElement) => number)} offset
 */
const stickyItemsDarkMode = (selector, offset) => {
    /** @type {HTMLElement[]} */
    // @ts-ignore
    const sections = [...document.querySelectorAll('.uk-section, [class*="uk-section-"]')];
    /** @type {HTMLElement[]} */
    // @ts-ignore
    const elements = [...document.querySelectorAll(selector)];
    for (const item of elements) {
        stickyItemContrast(sections, item, offset, {
            black: '',
            white: 'uk-dark',
        });
    }
};

// Sticky header, menu, social contrast
stickyItemsDarkMode(
    '.uni-header, .uni-sticky-menu, .uni-header-social',
    header => header.offsetTop + header.clientHeight / 2
);

// Sticky location, section-indicator contrast
stickyItemsDarkMode(
    '.uni-header-location, .uni-header-section-indicator',
    () => window.innerHeight / 2
);

// Sticky section indicator
{
    /** @type {HTMLElement} */
    const p = document.querySelector('.uni-header-section-indicator');

    if (p) {
        const liList = [...p.querySelectorAll('li[data-selector]')];
        const sections = liList.map(li => document.querySelector(li.getAttribute('data-selector')));

        const $window = $(window);
        let previousSectionIndex = 0;
        const handler = () => {
            const offset = window.innerHeight / 2;
            const sectionIndex = sections.map(section => {
                if (!(section instanceof HTMLElement)) return false;
                return window.scrollY + offset >= section.offsetTop;
            }).lastIndexOf(true);

            if (sectionIndex === -1) return;
            if (previousSectionIndex === sectionIndex) return;
            previousSectionIndex = sectionIndex;
            p.style.setProperty('--section-indicator-index', previousSectionIndex + '');
        };
        $window.on('scroll resize load darkmodechange', handler);
        handler();
    }
}

// Dark mode toggle
{
    document.querySelectorAll('[data-darkmode-toggle] input').forEach(darkToggle => {
        darkToggle.addEventListener('change', () => {
            setDarkMode(!isDarkMode());
            const isDark = isDarkMode();
            localStorage.setItem('darkMode', isDark ? '1' : '0');
        });
        // @ts-ignore
        darkToggle.checked = isDarkMode();
    });
}

// ScrollSpy Navigation Toggle
document.querySelectorAll('[data-uk-modal] [data-uk-scrollspy-nav] a').forEach(anchor => {
    anchor.addEventListener('click', e => {
        UIkit.toggle(anchor.closest('[data-uk-modal].uk-open')).toggle();
    });
});

// Horizontal Scroll
// @ts-ignore
document.querySelectorAll('.uk-horizontal-scroll').forEach((/** @type {HTMLElement} */ element) => {
    element.addEventListener('wheel', e => {
        e.preventDefault();
        element.scrollBy(e.deltaY, 0);
    });
});
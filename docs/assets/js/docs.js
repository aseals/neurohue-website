// @ts-check
/// <reference types="jquery"/>
/// <reference types="uikit"/>


// Search by keyword
const searchForm = document.querySelector('#searchForm');
/** @type {HTMLInputElement} */
const inputQuery = searchForm.querySelector('input[name=q]');
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const q = inputQuery.value;
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/find
    // @ts-ignore
    window.find(q, false, false, true);
});

// Pretty Print
// @ts-ignore
window.prettyPrint && prettyPrint();
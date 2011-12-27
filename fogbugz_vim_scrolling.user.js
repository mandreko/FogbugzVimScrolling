// ==UserScript==
// @name       FogBugz Scroller
// @namespace  http://www.mattandreko.com
// @version    1.0
// @description  FogBugz Scroller
// @include				htt*://support.leafsoftwaresolutions.com/fogbugz/*
// @require				https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @copyright  2011, Matt Andreko
// ==/UserScript==

var highlightColor = 'rgb(255, 255, 0)'; // yellow

jQuery.fn.reverse = [].reverse;

var bugEvents = $('.bugevent .summary').filter(':visible');

function getCurrentlyHighlightedBugEvent() {
    "use strict";
    var bugEvent = bugEvents.filter(function () {
        return ($(this).css('background-color') === highlightColor);
    });
    //var bugEvent = bugEvents.filter('.highlight');
    return bugEvent;
}

function isAtTopOfPage() {
    "use strict";
    var currentHighlighted = getCurrentlyHighlightedBugEvent();
    return ($(document).scrollTop() === 0 || // scrolled to the top of the page
            bugEvents.filter(":first")[0] === currentHighlighted[0]); // first bugevent in the list is the currently selected one
}

function isAtBottomOfPage() {
    "use strict";
    return $(document).scrollTop() + $(window).height() === $(document).height();
}

function highlightOnlyThisBugevent(bugEvent) {
    "use strict";
    bugEvents.each(function () {
        $(this).css("background-color", "");
    });
    bugEvent.css("background-color", highlightColor);
}

function scrollToElement(element) {
    "use strict";
    $('html,body').animate({
        scrollTop: element.offset().top
    }, 0);
}

function getNextBugEvent(reverse, fn) {
    "use strict";
    var list = bugEvents, nextPost = 0, currentPosition = 0;
    if (reverse) {
        list = list.reverse();
    }
    list.each(function () {
        currentPosition = $(this).offset().top;
        if (fn(currentPosition, $(document).scrollTop())) {
            nextPost = $(this);
            return false; // break the loop
        }
    });

    return nextPost;
}

function scrollDownToNextBugEvent() {
    "use strict";
    // if at the bottom of the page, there is no more scrolling to do, so just highlight the next bugEvent node in the dom
    var currentlyHighlighted = getCurrentlyHighlightedBugEvent(), nextPost;
    if (isAtBottomOfPage()) {
        nextPost = currentlyHighlighted.parent().next('.bugevent').children('.summary');
        if (currentlyHighlighted.length <= 0 || nextPost.length <= 0) { // don't do anything if nothing is highlighted, or if it's the last bugEvent on the page
            return;
        }
    } else {
        nextPost = getNextBugEvent(false, function (a, b) { return a > b; });
    }

    scrollToElement(nextPost);
    highlightOnlyThisBugevent(nextPost);
}

function scrollUpToPreviousBugEvent() {
    "use strict";
    if (isAtTopOfPage()) {
        return;
    }

    // find the previous bugevent
    var currentlyHighlighted = getCurrentlyHighlightedBugEvent(), previousPost = currentlyHighlighted.parent().prev('.bugevent').children('.summary');

    // if nothing is highlighted, default to the last element
    if (currentlyHighlighted.length === 0) {
        previousPost = bugEvents.filter(":last");
    } else if (currentlyHighlighted.length <= 0 && previousPost.length <= 0 && previousPost.offset().top <= $(document).scrollTop()) {
        // if not, do normal scroll behavior based on current viewport
        previousPost = getNextBugEvent(true, function (a, b) { return a < b; });
    }

    scrollToElement(previousPost);
    highlightOnlyThisBugevent(previousPost);
}

$(document).ready(function () {
    "use strict";
    $(this).keydown(function (e) {
        switch (e.keyCode) {
        case 74: // J
        case 106: // j
            scrollDownToNextBugEvent();
            break;
        case 75: // K
        case 107: // k
            scrollUpToPreviousBugEvent();
            break;
        }
    });
});
/// <reference path="ref/jquery.d.ts" />
/// <reference path="ref/js-cookie.d.ts" />
'use strict';
var authElem;
var mainElem;
var authorized = false;
var Offset = 0;

function loadImages() {
    VK.Api.call('wall.get', {
        domain: 'pictures.yandex',
        count: 100,
        offset: offset
    }, function(r) {
        r.response.items.forEach(function(element) {
            if (
                element.text.indexOf("://vk.com/doc") != -1 &&
                element.attachments.filter(el => el.type == "doc")
            ) {
                mainElem.append('<span class="item">' + element.text + '</span>');
                Offset++;
            }
        });
    });
}

function auth() {
    VK.Auth.login(function(session, status) {
        if (status == "connected") {
            authElem.hide();
            loadImages();
        }
    });
}

$(window).ready(function() {
    authElem = $('#auth');
    mainElem = $('#main')

    authElem.on('click', auth);
});

$(window).scroll(function() {
    if (authorized && $(window).scrollTop() + $(window).height() == $(document).height()) {
        loadImages();
    }
});
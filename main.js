/// <reference path="ref/jquery.d.ts" />
'use strict';
var authElem;
var mainElem;
var authorized = false;
var offset = 0;

function loadImages() {
    VK.Api.call('wall.get', {
        domain: 'pictures.yandex',
        count: 100,
        offset: offset
    }, function(r) {
        r.response.forEach(function(element) {
            if ("text" in element && "attachments" in element) {
                if (
                    element.text.indexOf("://vk.com/doc") != -1 &&
                    element.attachments.filter(el => el.type == "doc")
                ) {
                    mainElem.append('<span class="item">' + element.text + '</span>');
                }
            }
            offset++;
        });
    });
}

function auth() {
    VK.Auth.login(function(result) {
        if (result.status == "connected") {
            authorized = true;
            authElem.hide();
            loadImages();
        } else {
            alert("Auth error.");
            console.log(result);
        }
    });
}

$(window).ready(function() {
    authElem = $('#auth');
    mainElem = $('#main')

    VK.init({
        apiId: 5947241
    });
    authElem.on('click', auth);
});

$(window).scroll(function() {
    if (authorized && $(window).scrollTop() + $(window).height() == $(document).height()) {
        loadImages();
    }
});
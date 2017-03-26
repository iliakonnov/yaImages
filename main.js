/// <reference path="ref/jquery.d.ts" />
'use strict';
var endElem;
var loadElem;
var authElem;
var mainElem;
var allImagesShown = false;
var authorized = false;
var offset = 0;

function urlify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
}

function loadImages() {
    loadElem.show(0);
    VK.Api.call('wall.get', {
        domain: 'pictures.yandex',
        count: 100,
        offset: offset
    }, function(r) {
        if (r.response.length == 0) {
            allImagesShown = true;
            endElem.show(0);
        }
        r.response.forEach(function(element) {
            if (element != null && typeof element == 'object' &&
                "text" in element && "attachments" in element &&
                element.text.indexOf("://vk.com/doc") != -1 &&
                element.attachments.filter(el => el.type == "doc")
            ) {
                var date = new Date(element.date * 1000).toLocaleDateString();
                var src = element.attachments.filter(el => el.type == "photo")[0].photo.src;
                var bigSrc = element.attachments.filter(el => el.type == "photo")[0].photo.src_big;
                var text = urlify(element.text);
                var elem = $(
                    '<div class="panel panel-default imagePanel">' +
                    '    <div class="panel-heading">' + date + '</div>' +
                    '    <div class="panel-body"><div class="thumbnail">' +
                    '        <img src="' + src + '"></img>' +
                    '        <div class="caption imageCaption"><p>' + text + '</p></div>' +
                    '    </div></div>' +
                    '</div>'
                );
                elem.find('img').mouseenter(function() {
                    $(this).attr('src', bigSrc)
                }).mouseleave(function() {
                    $(this).attr('src', src)
                });
                elem.appendTo(mainElem);
            }
            offset++;
        });
        loadElem.hide(0);
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
    mainElem = $('#main');
    loadElem = $('#loader').hide(0);
    endElem = $('#end').hide(0);

    VK.init({
        apiId: 5947241
    });
    authElem.on('click', auth);
});

$(window).scroll(function() {
    if (!allImagesShown && authorized &&
        $(window).scrollTop() + $(window).height() == $(document).height() // Bottom
    ) {
        loadImages();
    }
});
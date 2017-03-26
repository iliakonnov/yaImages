/// <reference path="ref/jquery.d.ts" />
'use strict';
var authElem;
var mainElem;
var authorized = false;
var offset = 0;

function urlify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
}

function loadImages() {
    VK.Api.call('wall.get', {
        domain: 'pictures.yandex',
        count: 100,
        offset: offset
    }, function(r) {
        r.response.forEach(function(element) {
            if (element != null && typeof element == 'object' &&
                "text" in element && "attachments" in element &&
                element.text.indexOf("://vk.com/doc") != -1 &&
                element.attachments.filter(el => el.type == "doc")
            ) {
                /*
                <li class="list-group-item">
                    <img src={element.attachments.filter(el => el.type == "photo")[0].src_big}></img>
                    <p>
                        <span class="bg-info">{new Date(element.date*1000).toDateString()}</span>
                        {urlify(element.text)}
                    </p>
                </li>
                */
                mainElem.append(
                    '<li class="list-group-item"><img src=' + element.attachments.filter(el => el.type == "photo")[0].src_big +
                    '</img><p><span class="bg-info">' + new Date(element.date * 1000).toDateString() + '</span>' + urlify(element.text) + '</li>'
                );
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
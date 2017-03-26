/// <reference path="ref/jquery.d.ts" />
/// <reference path="ref/js-cookie.d.ts" />

var auth;
var token;
var main;

function removeHash() {
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
        // Prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

function load(offset) {
    var result = 0; // Images added
    $.ajax({
        dataType: "json",
        url: "https://api.vk.com/method/wall.get",
        async: false,
        data: {
            access_token: token,
            domain: 'pictures.yandex',
            count: 100,
            offset: offset
        },
        success: function(data) {
            data.response.items.forEach(function(element) {
                if (
                    element.text.indexOf("://vk.com/doc") != -1 &&
                    element.attachments.filter(el => el.type == "doc")
                ) {
                    main.after('<span class="item">' + element.text + '</span>');
                    result++;
                }
            });
        }
    });
    return result;
}

window.onload = function() {
    auth = $('#auth');
    token = $('#token');
    main = $('#main')

    auth.hide();
    toke.hide();
    if (window.location.hash) {
        var token = window.location.hash.substr(window.location.hash.indexOf('access_token='))
            .split('&')[0].split('=')[1];
        var expires = window.location.hash.substr(window.location.hash.indexOf('expires_in='))
            .split('&')[0].split('=')[1];
        if (expires != '0')
            Cookies.set('token', token, { 'expires': expires / (60 * 60 * 24) });
        else
            Cookies.set('token', token);
        removeHash();
    } else {
        var token = Cookies.get('token');
        if (!token)
            auth.show();
        else {
            token.text(token);
            token.show();
            load(0);
        }
    }
}

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        alert("bottom!");
    }
});
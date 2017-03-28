/// <reference path="ref/jquery.d.ts" />
'use strict';
var endElem;
var loadElem;
var authElem;
var mainElem;
var manualLoadElem;
var manualLoadBtnElem;
var calendar;
var loading = false;
var errorOccured = false;
var allImagesShown = false;
var highlighted = false;
var authorized = false;
var offset = 0;

function urlify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
}

function loadImages() {
    do {
        loading = true;
        loadElem.show(0);
        if (errorOccured) {
            errorOccured = false;
            manualLoadElem.hide(0);
        }
        VK.Api.call('wall.get', {
            domain: 'pictures.yandex',
            count: 100,
            offset: offset
        }, function(r) {
            if ("error" in r) {
                alert('Error №' + r.error.error_code + ': ' + r.error.error_msg);
                errorOccured = true;
                manualLoadElem.show(0);
            } else {
                if (r.response.length < 100) {
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
                        var elId = 'a' + date.split('.').join('_') + '-' + CRC32.str(element.text).toString(36).replace('-', '_');

                        var photo = element.attachments.filter(el => el.type == "photo")[0].photo;
                        var src = photo.src;
                        var bigSrc;
                        [photo.src_xxxbig, photo.src_xxbig, photo.src_xbig, photo.src_big, photo.src].forEach(function(item) {
                            if (!bigSrc && item) {
                                bigSrc = item;
                            }
                        });

                        var text = urlify(element.text);
                        var elem = $(
                            '<div class="panel panel-default imagePanel" id="' + elId + '">' +
                            '    <div class="panel-heading"><a class="btn btn-default">' + date + '</a></div>' +
                            '    <div class="panel-body"><div class="thumbnail">' +
                            '        <img class="img-thumbnail image" src="' + src + '" data-image="' + bigSrc + '"></img>' +
                            '        <div class="caption imageCaption"><p>' + text + '</p></div>' +
                            '    </div></div>' +
                            '</div>'
                        );
                        Intense(elem.find('img')[0]);
                        elem.find('.btn').click(function(e) {
                            e.preventDefault();
                            window.location.hash = elId;
                            highlighted = false;
                            highlightHash();
                        });
                        elem.appendTo(mainElem);
                    }
                    offset++;
                });
            }
            loading = false;
            loadElem.hide(0);
        });
    } while (!highlightHash())
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

function highlightHash() {
    if (window.location.hash && !highlighted) {
        var result = highlight($(window.location.hash));
        if (result) highlighted = true;
        return result
    } else return true;
}

function highlightDate(date) {
    return highlight(
        $('.panel-heading:contains("' + date.toLocaleDateString() + '")').parent()
    );
}

function highlight(elem) {
    if (elem.length != 0) {
        $('.panel-primary').removeClass('panel-primary').addClass('panel-default')
        elem.removeClass('panel-default').addClass('panel-primary');
        elem[0].scrollIntoView();
        return true;
    } else if (allImagesShown) {
        $('#myModal').modal('show');
        return true;
    } else {
        return false;
    }
}

$(window).ready(function() {
    authElem = $('#auth');
    mainElem = $('#main');
    loadElem = $('#loader').hide(0);
    endElem = $('#end').hide(0);
    manualLoadElem = $('#manualLoad').hide(0);
    manualLoadBtnElem = $('#manualLoadBtn');

    VK.init({
        apiId: 5947241
    });
    authElem.on('click', auth);
    manualLoadBtnElem.on('click', loadImages);
    var calendar = new Pikaday({
        field: $('#calendar')[0],
        onSelect: function(date) {
            highlightDate(date);
        }
    });
});

$(window).scroll(function() {
    if (!allImagesShown && authorized && !errorOccured && !loading &&
        $(window).scrollTop() + $(window).height() == $(document).height() // Bottom
    ) {
        loadImages();
    }
});
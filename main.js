/// <reference path="ref/jquery.d.ts" />
'use strict';
var endElem;
var loadElem;
var authElem;
var mainElem;
var manualLoadElem;
var manualLoadBtnElem;
var loadAllBtnElem;
var calendarElem;
var loading = false;
var errorOccured = false;
var allImagesShown = false;
var highlighted = false;
var authorized = false;
var offset = 0;

function urlify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
}

function addImagesCallback(checkFunc, recursion) {
    return function(response) {
        if ("error" in response) {
            $('#modalText').text('Error №' + r.error.error_code + ': ' + r.error.error_msg);
            $('#myModal').modal('show');
            errorOccured = true;
            manualLoadElem.show(0);
        } else {
            if (response.response.length < 100) {
                allImagesShown = true;
                endElem.show(0);
                loadAllBtnElem.prop('disbled', true);
            }
            response.response.forEach(function(element) {
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
        if (!checkFunc()) {
            if (recursion < 250) {
                loadImages(checkFunc, recursion + 1);
            } else {
                $('#modalText').text('Max recursion depth reached. Try again');
                $('#myModal').modal('show');
            }
        }
        loading = false;
        loadElem.hide(0);
    }
}

function loadImages(checkFunc, recursion = 1) {
    if (typeof checkFunc != "function")
        checkFunc = function() { return true; }
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
    }, addImagesCallback(checkFunc, recursion));
}

function auth() {
    VK.Auth.login(function(result) {
        if (result.status == "connected") {
            authorized = true;
            authElem.hide();
            manualLoadBtnElem.prop('disabled', false);
            loadAllBtnElem.prop('disabled', false);
            calendarElem.prop('disabled', false);
            loadImages();
            highlightHash();
        } else {
            $('#modalText').text('Auth error');
            $('#myModal').modal('show');
            console.log(result);
        }
    });
}

function highlightHash() {
    if (window.location.hash && !highlighted) {
        loadImages(function() {
            var result = highlight($(window.location.hash));
            if (result) highlighted = true;
            return result
        });
    }
}

function highlightDate(date) {
    loadImages(function() {
        return highlight(
            $('.panel-heading:contains("' + date.toLocaleDateString() + '")').parent()
        );
    });
}

function highlight(elem) {
    if (elem.length != 0) {
        $('.panel-primary').removeClass('panel-primary').addClass('panel-default')
        elem.removeClass('panel-default').addClass('panel-primary');
        elem[0].scrollIntoView();
        return true;
    } else if (allImagesShown) {
        $('#modalText').text('Image not found');
        $('#myModal').modal('show');
        return true;
    } else {
        return false;
    }
}

$(window).ready(function() {
    authElem = $('#auth').on('click', auth);
    mainElem = $('#main');
    loadElem = $('#loader').hide(0);
    endElem = $('#end').hide(0);
    manualLoadElem = $('#manualLoadBtn').hide(0);
    manualLoadBtnElem = $('#manualLoadBtn').on('click', loadImages).prop('disabled', true);
    calendarElem = $('#calendar').prop('disabled', true);
    loadAllBtnElem = $('#loadAll').on('click', function() {
        loadImages(function() {
            if (allImagesShown) {
                $('html, body').animate({
                    scrollTop: document.body.scrollHeight
                }, 'slow');
                return true;
            } else return false;
        });
    }).prop('disabled', true);;

    $('#leftMenu').affix({
        offset: 0
    }).on('affix.bs.affix', function() {
        if (!$(window).scrollTop()) return false;
    }).width($('#leftMenu').parent().width());

    VK.init({
        apiId: 5947241
    });
    var calendar = new Pikaday({
        field: calendarElem[0],
        onSelect: function(date) {
            highlightDate(date);
        }
    });

    var elevator = new Elevator({
        element: $('#goTop')[0],
        mainAudio: './external/elevator/elevator.mp3',
        endAudio: './external/elevator/ding.mp3',
        startCallback: function() { $('#goTop').prop('disabled', true); },
        endCallback: function() { $('#goTop').prop('disabled', false); },
        duration: 5000
    });
});

$(window).scroll(function() {
    if (!allImagesShown && authorized && !errorOccured && !loading &&
        $(window).scrollTop() + $(window).height() == $(document).height() // Bottom
    ) {
        loadImages();
    }
});
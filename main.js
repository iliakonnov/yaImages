/// <reference path="ref/jquery.d.ts" />
/// <reference path="ref/js-cookie.d.ts" />

window.onload = function() {
    $('#auth').hide();
    $('#token').hide();
    if (window.location.hash) {
        var token = window.location.hash.substr(window.location.hash.indexOf('access_token='))
            .split('&')[0].split('=')[1];
        var expires = window.location.hash.substr(window.location.hash.indexOf('expires_in='))
            .split('&')[0].split('=')[1];
        if (expires != '0') Cookies.set('token', token, { 'expires': expires / (60 * 60 * 24) })
        else Cookies.set('token', token)
    } else {
        var token = Cookies.get('token');
        if (!token) $('#auth').show();
        else {
            $('#token').text(token).show();
        }
    }
}
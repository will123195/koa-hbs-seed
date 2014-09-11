$(function() {

    // responsive formatting based on window width
    if ($(window).width() >= 1000) {
        $('body').addClass('r1000');
    } else if ($(window).width() >= 640) {
        $('body').addClass('r640');
    } else {
        $('body').addClass('r320');
    }

    // on window resize
    $(window).resize(function() {

        var w = $(this).width();
        if (w >= 1000) {
            $('body')
                .addClass('r1000')
                .removeClass('r640')
                .removeClass('r320');
        } else if (w >= 640) {
            $('body')
                .addClass('r640')
                .removeClass('r1000')
                .removeClass('r320');
        } else {
            $('body')
                .addClass('r320')
                .removeClass('r1000')
                .removeClass('r640');
        }
    });

});




(function($) {

    $.fn.render = function(name, data) {
        name = getTemplateName(name);
        this.html(Handlebars.templates[name](data));
        return this;
    };

    $.render = function(name, data) {
        name = getTemplateName(name);
        var html = Handlebars.templates[name](data);
        return html;
    };

    function getTemplateName(nickname) {
        var basename = nickname.split('/').reverse()[0];
        var names = [
            nickname,
            nickname + '/' + basename,
            'templates/' + nickname
        ];
        var match;
        names.forEach(function(name) {
            if (Handlebars.templates[name]) {
                match = name;
            }
        });
        if (match) {
            return match;
        }
        throw new Error('$.render: Invalid template name.');
    }

}(jQuery));




function debug() {
    if ($(window).width() !== $(document).width()) {
        $(window).width($(document).width());
    }
    $('#debug').html(
        'win-w: ' + $(window).width() + ', ' +
        'html-w: ' + $('html').width() + ', ' +
        'doc-w: ' + $(document).width() + ', ' +
        'doc-h: ' + $(document).height() + ', ' +
        'o: ' + window.orientation
    );
}

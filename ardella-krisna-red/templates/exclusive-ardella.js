// Gallery Single Slider
window.GALLERY_SINGLE_SLIDER = true;

// Photo Options Nav
var photo_nav_options = {
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    adaptiveHeight: false,
    variableWidth: false,
    infinite: true,
    useTransform: true,
    speed: 500,
    cssEase: "cubic-bezier(0.77, 0, 0.18, 1)",
    asNavFor: $(".photo-slider"),
};

// Photo Options Slider
var photo_slider_options = {
    centerMode: true,
    swipeToSlide: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: false,
    arrows: true,
    adaptiveHeight: false,
    variableWidth: true,
    infinite: true,
    useTransform: true,
    speed: 500,
    cssEase: "cubic-bezier(0.77, 0, 0.18, 1)",
    prevArrow: $(".photo-arrow.prev"),
    nextArrow: $(".photo-arrow.next"),
    asNavFor: $(".photo-nav"),
};

// Resize Photo Nav
var resize_photo_nav = function () {
    var $nav = $('.photo-nav');

    // width
    var width = $nav.width() || 1;

    // decrease size to smaller size to parent width
    width = Math.floor(width - (38.4 / 100) * width);

    // set maximal height
    var height = width + (width / 3);

    // each height
    $nav.find('.preview-wrap').each((i, o) => {
        $(o).css({
            'width': `${width}px`,
            'height': `${height}px`
        });
    });
}


// toggle show wedding gift bank
var toggleKado = function () {
    $(".hadiah-content").slideToggle();
};

let checkInterval = setInterval(() => {
    if ($('.wk-wrap').length > 0) {
        clearInterval(checkInterval);

        // pasang event disini
        $(".wk-wrap").on('click', function () {
            $(this).toggleClass("active");
            toggleKado();
        });
    }
}, 300);


setTimeout(() => {
    clearInterval(checkInterval);
}, 5000);


$(document).ready(function () {
    const video = $('#tcVideo');
    const source = $('#tcVideoSource');

    function setVideoSource() {
        const width = window.innerWidth;
        let videoSrc;

        if (width <= 560) {
            videoSrc = '../media/core/media/template/exclusive/ardella/original/vid-mb.mp4';
        } else {
            videoSrc = '../media/core/media/template/exclusive/ardella/original/vid-tab.mp4';
        }

        const currentSrc = source.attr('src');
        if (currentSrc !== videoSrc) {
            source.attr('src', videoSrc);

            if (video.length > 0) {
                video[0].load();
                video[0].play().catch(function (error) {
                    console.log('Video autoplay prevented:', error);
                });
            }
        }

    }

    setVideoSource();

    let resizeTimer;
    $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setVideoSource, 250);
    });

    // document.addEventListener('visibilitychange', function () {
    //     if (document.visibilityState === 'visible' && source.attr('src') && video.length > 0) {
    //         video[0].play().catch(function (error) {
    //             console.log('Video play prevented:', error);
    //         });
    //     }
    // });
});

// On Ready
$(document).ready(function () {
    resize_photo_nav();

    if ($(".photo-nav").children().length > 0) {
        // Slick
        $(".photo-nav").slick(photo_nav_options);
    }

    if ($(".photo-slider").children().length > 0) {
        // Slick
        $(".photo-slider").slick(photo_slider_options);
    }

    // RSVP Guest Counter (Handled in template.js)

    // RSVP Radio Button Active State
    $(".rsvp-option input[type='radio']").on('change', function () {
        $(this).closest(".rsvp-options").find(".rsvp-option").removeClass("active");
        if ($(this).is(":checked")) {
            $(this).closest(".rsvp-option").addClass("active");
        }
    });
})
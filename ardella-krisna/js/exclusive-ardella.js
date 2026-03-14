// Gallery Single Slider
window.GALLERY_SINGLE_SLIDER = true;

// Photo Options Nav
var photo_nav_options = {
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    adaptiveHeight: false,
    infinite: true,
    useTransform: true,
    speed: 500,
    cssEase: "ease",
    asNavFor: ".photo-slider",
};

// Photo Options Slider
var photo_slider_options = {
    centerMode: true,
    swipeToSlide: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    variableWidth: false,
    infinite: true,
    useTransform: true,
    speed: 500,
    cssEase: "ease",
    prevArrow: $(".photo-arrow.prev"),
    nextArrow: $(".photo-arrow.next"),
    asNavFor: ".photo-nav",
    rows: 1,
    slidesPerRow: 1,
    responsive: [
        {
            breakpoint: 960,
            settings: {
                slidesToShow: 4
            }
        },
        {
            breakpoint: 560,
            settings: {
                slidesToShow: 3
            }
        }
    ]
};

// Resize Photo Nav
var resize_photo_nav = function () {
    var $nav = $('.photo-nav');

    // width
    var width = $nav.width() || 1;

    // decrease size to smaller size to parent width
    width = Math.floor(width - (38.4 / 100) * width);

    // set maximal height for 1:1.5 ratio
    var height = width * 1.5;

    // each height
    $nav.find('.preview-wrap').each((i, o) => {
        $(o).css({
            'width': `${width}px`,
            'height': `${height}px`
        });
    });
}


// On Ready
$(document).ready(function () {
    resize_photo_nav();

    if ($(".photo-slider").children().length > 0) {
        // Initialize Nav (Thumbnails) first for better sync
        $(".photo-slider").slick(photo_slider_options);
    }

    if ($(".photo-nav").children().length > 0) {
        // Initialize Main Slider second
        $(".photo-nav").slick(photo_nav_options);
    }

    $(".photo-slider").on("click", ".slick-slide", function () {
        var index = $(this).attr("data-slick-index");
        $(".photo-nav").slick("slickGoTo", parseInt(index));
    });

    if ($(".photo-slider").children().length > 0) {
        var $slider = $(".photo-slider");

        $slider.on('wheel', function (e) {
            e.preventDefault();

            const delta = e.originalEvent.deltaY || e.originalEvent.deltaX;

            if (delta > 0) {
                $(this).slick('slickNext');
            } else {
                $(this).slick('slickPrev');
            }
        });
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
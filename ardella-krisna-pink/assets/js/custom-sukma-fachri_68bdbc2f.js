// Love Story
var init_love_story = function () {

    var galleryWrap = $('.story-chitra__slider-wrap');

    if (galleryWrap.length) {

        var sliderForOptions = {
            slidesToShow: 1,
            slidesToScroll: 1,
            // fade: false,
            arrows: false,
            adaptiveHeight: true,
            // infinite: false,
            useTransform: true,
            variableWidth: true,
            speed: 300,
            arrows: false,
            cssEase: 'cubic-bezier(0.77, 0, 0.18, 1)',
        }

        // Sliders
        var sliderForWrap = $('.story-chitra__slider-for');

        $(sliderForWrap)
            .on('init', function (event, slick) {
                $('.story-chitra__slider-nav__item__manual').eq(0).addClass('is-active');

                var width = $(this).find('.story-chitra__slider-for__item').width();
                var height = width + (width / 3) + 73.4;


                $('.story-chitra__slider-for__item').css('width', (320 + 'px'));
                $('.story-chitra__slider-for__item').css('height', height + 'px');
            })
            .slick(sliderForOptions);

        $(sliderForWrap).on('afterChange', function (event, slick, currentSlide) {
            var manualNav = $('.story-chitra__slider-nav__item__manual');
            for (var i = 0; i < manualNav.length; i++) {
                var slickIndex = $(manualNav[i]).attr('data-slick-index');
                if (slickIndex <= currentSlide) $(manualNav[i]).addClass('is-active')
                if (slickIndex > currentSlide) $(manualNav[i]).removeClass('is-active')
            }
        });

    }

}

// toggle show wedding gift bank
var toggleGift = function () {
    // Jika wedding gift body sedang tersembunyi, tampilkan dan sembunyikan yang lain
    if ($(".wedding-gift-body").is(":hidden")) {
        $(".custom-wedding-gifts-body").slideUp();
        $(".wedding-gift-body").slideDown();
    } else {
        $(".wedding-gift-body").slideUp();
    }
};

// toggle show wedding gifts
var toggleGifts = function () {
    // Jika custom wedding gifts body sedang tersembunyi, tampilkan dan sembunyikan yang lain
    if ($(".custom-wedding-gifts-body").is(":hidden")) {
        $(".wedding-gift-body").slideUp();
        $(".custom-wedding-gifts-body").slideDown();
    } else {
        $(".custom-wedding-gifts-body").slideUp();
    }
};

$(document).ready(function () {
    init_love_story();

    $("#toggleGift").click(toggleGift);
    $("#toggleGifts").click(toggleGifts);
})
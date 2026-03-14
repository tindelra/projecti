/*  ===========================
        FUNCTIONS && OBJECTS
========================== */

/* =================================================
    LOCAL BACKEND MOCKING (localStorage)
================================================= */
window.MockBackend = {
    getWishes: function () {
        return JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    },
    saveWish: function (name, comment, attendance = null, id = null) {
        const wishes = this.getWishes();
        const newWish = {
            name: name,
            comment: comment,
            attendance: attendance,
            date: new Date().toISOString(),
            id: id || Date.now()
        };
        wishes.unshift(newWish);
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
        return newWish;
    },
    deleteWish: function (id, btn = null) {
        if (!confirm('Hapus komentar ini secara permanen?')) return;

        // Visual feedback (with fallback to find button by ID)
        let $btn = btn ? $(btn) : $(`.delete-btn[data-comment="${id}"]`);
        if ($btn && $btn.length > 0) {
            $btn.html('<i class="fas fa-spinner fa-spin"></i> <small>Menghapus...</small>');
            $btn.css('pointer-events', 'none');
        }

        // 1. Delete locally
        let wishes = this.getWishes();
        wishes = wishes.filter(w => w.id != id);
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

        // 2. Delete from Google Sheets
        const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAad1QxtH97DLSOXb6fzKxMM86yyn8fCo3UqevukjZcLr6xVffG3y0RASmI-R5qwEi/exec';

        fetch(SHEET_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'deleteComment',
                id: id,
                category: 'ardella-krisna'
            })
        }).then(() => {
            console.log('Delete request sent to sheet');
            if ($btn) {
                $btn.closest('.comment-item').fadeOut(500, function () {
                    $(this).remove();
                });
            } else {
                window.location.reload();
            }
        }).catch(err => {
            console.error('Delete sheet error:', err);
            if ($btn) {
                // Still remove locally even if sheet fails (user expects immediate action)
                $btn.closest('.comment-item').fadeOut(500, function () {
                    $(this).remove();
                });
            } else {
                window.location.reload();
            }
        });
    },
    getRSVPs: function () {
        return JSON.parse(localStorage.getItem('wedding_rsvp') || '[]');
    },
    saveRSVP: function (rsvpData) {
        const rsvps = this.getRSVPs();
        rsvps.push({
            ...rsvpData,
            date: new Date().toISOString()
        });
        localStorage.setItem('wedding_rsvp', JSON.stringify(rsvps));
    },
    formatCommentItems: function (wishes) {
        const urlParams = new URLSearchParams(window.location.search);
        const adminKey = 'ardella123';
        const isAdmin = urlParams.get('admin') === adminKey || urlParams.get('Admin') === adminKey || urlParams.get('admin') === 'true' || urlParams.get('Admin') === 'true';

        if (!wishes || wishes.length === 0) {
            let msg = '<p class="text-center" style="padding: 20px; color: var(--text-secondary);">Tuliskan doa dan ucapan terbaik Anda untuk kami.</p>';
            if (isAdmin && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                msg += '<p class="text-center" style="font-size: 0.8em; color: #8B0000; padding: 10px; background: #fff5f5; border-radius: 8px; margin: 0 15px 20px;"><b>Admin Note:</b> Komentar tidak muncul di localhost karena masalah CORS. Silakan cek di website live (goinvitation.site) atau nonaktifkan keamanan CORS di browser Anda untuk testing.</p>';
            }
            return msg;
        }

        // Change 'ardella123' to your preferred password

        // Add visual indicator for Admin Mode
        if (isAdmin && !document.getElementById('admin-badge')) {
            const badge = document.createElement('div');
            badge.id = 'admin-badge';
            badge.innerHTML = 'Admin Mode Active 🔓';
            badge.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #8B0000; color: white; padding: 5px 15px; border-radius: 20px; font-family: sans-serif; font-size: 12px; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-weight: bold; pointer-events: none; user-select: none; -webkit-user-select: none;';
            document.body.appendChild(badge);

            // Add CSS for delete button
            const style = document.createElement('style');
            style.innerHTML = `
                .delete-btn {
                    background: none;
                    border: none;
                    padding: 8px;
                    margin: -8px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 999;
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: #d9534f;
                    transition: transform 0.2s;
                }
                .delete-btn:hover { transform: scale(1.1); color: #c9302c; }
                .delete-btn:active { transform: scale(0.95); }
            `;
            document.head.appendChild(style);
            console.log('✅ Admin Mode Activated');
        }

        return wishes.map(w => {
            const dateObj = new Date(w.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            return `
            <div class="comment-item" style="margin-bottom: 12px; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div class="comment-head" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <span class="name" style="font-weight: 700; color: #8B0000; font-family: var(--body-text-family); font-size: 1.1em;">
                        ${w.name}
                        ${w.attendance === 'will_attend' ? '<i class="fas fa-check-circle" style="color: #28a745; font-size: 0.8em; margin-left: 5px;" title="Will Attend"></i>' : ''}
                        ${w.attendance === 'unable_to_attend' ? '<i class="fas fa-times-circle" style="color: #dc3545; font-size: 0.8em; margin-left: 5px;" title="Unable to Attend"></i>' : ''}
                    </span>
                    ${isAdmin ? `
                    <button class="delete-btn" data-delete="delete_comment" data-comment="${w.id}">
                        <i class="fas fa-trash"></i> <small style="font-weight: bold;">Hapus</small>
                    </button>` : ''}
                </div>
                <div class="comment-date" style="font-size: 0.85em; color: #888; margin-bottom: 8px; font-family: var(--body-text-family);">
                    ${dateStr}, ${timeStr}
                </div>
                <div class="comment-body">
                    <p style="margin: 0; color: #333; line-height: 1.4; font-family: var(--body-text-family);">${w.comment}</p>
                </div>
            </div>`;
        }).join('');
    }
};


// Hide Alert
var hideAlert = function () {
    var $alert = $('#alert');
    $alert.removeClass();               // Remove All Classes
    $alert.addClass('alert hide');      // hiding alert 
}

// Show Alert
var showAlert = function (message, status, delay = 3000) {
    if (status != '') {
        // var $alert = $('#alert');
        // $alert.removeClass();
        // $alert.addClass('alert show ' + status);
        // $alert.find('.alert-text').text(message);

        // if (delay != null) setTimeout(hideAlert, delay);
    }
}

// Show Loader
var showLoader = function () {
    if ($('.loader-outer').hasClass('active')) {
        $('.loader-outer').removeClass('active');
    }
    $('.loader-outer').addClass('active');
}

// Hide Loader
var hideLoader = function () {
    if ($('.loader-outer').hasClass('active')) {
        $('.loader-outer').removeClass('active');
    }
}

// Post Data
var postData = function (data, onSuccess = () => { }, onError = () => { }, beforeSend = () => { }, callback_xhr = () => { }, props) {
    if (data) {
        // --- Intercepting for MockBackend ---
        let isMocked = false;
        let response = { error: false, message: 'Success' };

        if (data instanceof FormData) {
            const action = data.get('post');
            if (action === 'newComment') {
                const name = data.get('name') || 'Guest';
                const comment = data.get('comment');
                const rsvpData = localStorage.getItem('wedding_rsvp_data');
                let attendance = null;
                if (rsvpData) {
                    const params = new URLSearchParams(rsvpData);
                    attendance = params.get('attendance');
                }
                if (comment) {
                    // --- Google Sheets Integration ---
                    const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAad1QxtH97DLSOXb6fzKxMM86yyn8fCo3UqevukjZcLr6xVffG3y0RASmI-R5qwEi/exec';

                    const attendanceMap = {
                        'will_attend': 'Hadir',
                        'unable_to_attend': 'Tidak Hadir'
                    };

                    const wishId = Date.now();
                    fetch(SHEET_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'wish',
                            name: name,
                            comment: comment,
                            attendance: attendanceMap[attendance] || attendance || 'Hadir',
                            date: new Date().toLocaleString(),
                            id: wishId,
                            category: 'Resepsi'
                        })
                    }).then(() => console.log('Wish sent to sheet'))
                        .catch(err => console.error('Wish sheet error:', err));
                    // ---------------------------------

                    window.MockBackend.saveWish(name, comment, attendanceMap[attendance] || attendance || null, wishId);

                    response.message = 'Ucapan Anda sedang diproses...';
                    isMocked = true;
                }
            } else if (action === 'loadComment' || action === 'moreComment') {
                const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAad1QxtH97DLSOXb6fzKxMM86yyn8fCo3UqevukjZcLr6xVffG3y0RASmI-R5qwEi/exec';
                const start = parseInt(data.get('start') || 0);
                const limit = parseInt(data.get('limit') || 5);

                const fetchComments = async () => {
                    let responseData = { error: false, message: 'Success', commentItems: '', nextComment: 0 };

                    // 1. Initial Local Render (Only for fresh load)
                    if (start === 0) {
                        const localWishes = window.MockBackend.getWishes();
                        if (localWishes.length > 0) {
                            responseData.commentItems = window.MockBackend.formatCommentItems(localWishes);
                            if (typeof onSuccess === 'function') onSuccess(responseData);
                        }
                    }

                    // 2. Fetch from Sheet with Timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

                    try {
                        const fetchUrl = `${SHEET_SCRIPT_URL}?action=loadComment&start=${start}&limit=${limit}&_t=${Date.now()}`;
                        const res = await fetch(fetchUrl, { signal: controller.signal });
                        clearTimeout(timeoutId);

                        const json = await res.json();
                        const sheetWishes = (json.commentItems && Array.isArray(json.commentItems)) ? json.commentItems : [];

                        // 3. Merge and Sync
                        const localWishes = window.MockBackend.getWishes();
                        const finalWishes = [...localWishes];

                        sheetWishes.forEach(item => {
                            const exists = finalWishes.some(lw =>
                                (lw.id && item.id && lw.id == item.id) ||
                                (lw.name === item.name && lw.comment === item.comment)
                            );
                            if (!exists) {
                                finalWishes.push({
                                    name: item.name,
                                    comment: item.comment,
                                    attendance: item.attendance,
                                    date: item.date,
                                    id: item.id
                                });
                            }
                        });

                        responseData.commentItems = window.MockBackend.formatCommentItems(finalWishes);
                        responseData.nextComment = json.nextComment || 0;
                    } catch (err) {
                        console.error('[CommentSync] Fetch error:', err);
                        if (start === 0) {
                            const localWishes = window.MockBackend.getWishes();
                            responseData.commentItems = window.MockBackend.formatCommentItems(localWishes);
                        }
                    }

                    if (typeof beforeSend === 'function') beforeSend();
                    if (typeof onSuccess === 'function') onSuccess(responseData);
                };

                fetchComments();
                return; // Handled async
            }
            else if (data.has('attendance') || data.has('rsvp_status')) {
                // RSVP Form serialization
                const rsvpData = {};
                for (let [key, value] of data.entries()) { rsvpData[key] = value; }

                // --- Google Sheets Integration ---
                const SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAad1QxtH97DLSOXb6fzKxMM86yyn8fCo3UqevukjZcLr6xVffG3y0RASmI-R5qwEi/exec';

                // Map values to Indonesian
                const attendanceMap = {
                    'will_attend': 'Hadir',
                    'unable_to_attend': 'Tidak Hadir'
                };
                const eventMap = {
                    'akad': 'Akad Nikah',
                    'resepsi': 'Resepsi',
                    'all': 'Hadir di Keduanya'
                };

                // Get name from URL if available
                const urlParams = new URLSearchParams(window.location.search);
                const guestName = urlParams.get('to') || 'Tamu';

                fetch(SHEET_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'rsvp',
                        name: guestName,
                        attendance: attendanceMap[rsvpData.attendance] || rsvpData.attendance,
                        event: eventMap[rsvpData.event] || rsvpData.event || 'Hadir di Keduanya',
                        persons: (rsvpData.persons || rsvpData.guest_count || 1) + ' Orang',
                        date: new Date().toLocaleString(),
                        category: 'Resepsi'
                    })
                }).then(() => console.log('RSVP sent to sheet'))
                    .catch(err => console.error('RSVP sheet error:', err));
                // ---------------------------------

                window.MockBackend.saveRSVP(rsvpData);
                response.message = 'Terima Kasih!';
                response.rsvp_content = `
                    <style>
                        .rsvp-success { display: flex; flex-direction: column; align-items: center; gap: 15px; text-align:center; padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important; width: 100%; }
                        .rsvp-success h3 { font-family: var(--heading-family); color: var(--text-tertiary); margin-bottom: 5px; font-size: 3.5rem; line-height: 1.2; }
                        .rsvp-success p { color: var(--text-tertiary); font-family: var(--body-text-family); margin-bottom: 30px; font-size: 1.1rem; }
                        .rsvp-success .rsvp-confirm-btn { margin-top: 10px; width: 100%; max-width: 250px; padding: 14px 20px; background-color: var(--button-background-tertiary); color: var(--text-tertiary); border: none; border-radius: 50px; font-family: var(--body-text-family); font-size: 1.2rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                        @media (max-width: 960px) {
                            .rsvp-success { gap: 7px; }
                            .rsvp-success h3 { font-size: 3rem; }
                            .rsvp-success p { font-size: 1rem; }
                            .rsvp-success i { font-size: 2.5rem !important; }
                        }
                    </style>
                    <div class="rsvp-success">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--text-tertiary); margin-bottom: 20px;"></i>
                        <h3>Terima Kasih</h3>
                        <p>Konfirmasi kehadiran Anda sudah kami terima.</p>
                        <button type="button" class="rsvp-confirm-btn" onclick="location.reload()">Ubah Jawaban</button>
                    </div>`;
                isMocked = true;
            } else if (action === 'sendGift') {
                response.message = 'Thank you for your gift! We have received your confirmation.';
                response.wedding_gift_message = `
                    <div class="gift-success" style="text-align:center; padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important;">
                        <i class="fas fa-heart" style="font-size: 3rem; color: var(--button-text-tertiary); margin-bottom: 20px;"></i>
                        <h3 style="font-family: var(--heading-family); color: var(--text-tertiary); margin-bottom: 10px; font-size: 3.5rem;">Thank You</h3>
                        <p style="color: var(--text-tertiary); font-family: var(--body-text-family); font-size: 1.1rem;">Gift Confirmation Received!</p>
                        <button type="button" class="gift-confirm-btn" onclick="location.reload()" style="margin-top: 20px; width: 100%; max-width: 250px; padding: 14px 24px; background-color: var(--button-background-tertiary); color: var(--button-text-tertiary); border: none; border-radius: 50px; font-family: var(--body-text-family); font-size: 1.2rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Back</button>
                    </div>`;
                isMocked = true;
            }
        }

        if (isMocked) {
            if (typeof beforeSend === 'function') beforeSend();
            setTimeout(() => {
                if (typeof onSuccess === 'function') onSuccess(response);
                if (response.message && typeof showAlert === 'function') showAlert(response.message, 'success');
            }, 800);
            return;
        }
        // --- End Intercepting ---

        $.ajax({
            url: props?.url || '',
            type: 'post',
            dataType: 'json',
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            beforeSend: function () {
                // Before Send
                if (typeof beforeSend === 'function') beforeSend();

                // Show Loader
                if (data.isShowLoader && data.isShowLoader === true) showLoader();
            },
            success: function (res) {
                // Hide Loader
                if (data.isShowLoader && data.isShowLoader === true) hideLoader();

                // Success
                if (res.error === false) {
                    // On Success
                    if (typeof onSuccess === 'function') onSuccess(res);

                    // Success Message
                    if (typeof res.message !== 'undefined' && res.message) showAlert(res.message, 'success');
                }

                // Error
                if (res.error === true) {
                    // On Error
                    if (typeof onError === 'function') onError(res);

                    // Error Message
                    if (typeof res.message !== 'undefined' && res.message) showAlert(res.message, 'error');
                }
            },
            error: function (jqXHR) {
                var res;

                try {
                    // Parse Response Text
                    res = jqXHR.responseText ? JSON.parse(jqXHR.responseText) : '';
                } catch (err) { }

                // On Error
                if (typeof onError === 'function') onError(res);
            },
            xhr: function () {
                var xhr = new window.XMLHttpRequest();

                // Upload progress
                xhr.upload.addEventListener("progress", function (e) {
                    // console.log(e.lengthComputable ? e.loaded / e.total : 0);
                }, false);

                // Download progress
                xhr.addEventListener("progress", function (e) {
                    // console.log(e.lengthComputable ? e.loaded / e.total : 0);
                }, false);

                // Callback XHR
                if (typeof callback_xhr === 'function') callback_xhr(xhr);

                return xhr;
            }
        });
    }
}

// Copy to Clipboard
var copyToClipboard = function (text) {
    if (!navigator.clipboard) {
        // ExecCommand
        var dummy = document.createElement("textarea");

        // to avoid breaking orgain page when copying more words
        // cant copy when adding below this code
        // dummy.style.display = 'none'
        document.body.appendChild(dummy);

        //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
        dummy.value = text;
        dummy.select();

        document.execCommand("copy");
        document.body.removeChild(dummy);

        // Show Alert
        return showAlert('Berhasil di salin ke papan klip', 'success');
    } else {
        // Clipboard API
        return navigator.clipboard.writeText(text).then(() => {
            showAlert('Berhasil di salin ke papan klip', 'success');
        });
    }
}

// Copy Text
var copy_text = function (e) {
    e.preventDefault();
    var txt = $(this).attr('data-copy');
    if (txt && txt != '') return copyToClipboard(txt);
}

// Get Offset
var getOffset = function (elem) {
    var offsetLeft = 0, offsetTop = 0, parent = elem;

    do {
        if (!isNaN(elem.offsetLeft)) {
            offsetLeft += elem.offsetLeft;
            offsetTop += elem.offsetTop;
            parent = elem;
        }
    } while (elem = elem.offsetParent);

    return {
        left: offsetLeft,
        top: offsetTop,
        parent: parent
    };
}

// Generate Tooltip
var generate_tooltip = function () {
    var target = this;
    var tip = target.getAttribute("title");

    var tooltip = document.createElement("div");
    tooltip.id = "tooltip";

    if (!tip || tip == "") return false;

    target.removeAttribute("title");

    tooltip.style.opacity = 0;
    tooltip.innerHTML = tip;

    document.body.appendChild(tooltip);

    // Init Tooltip
    var init_tooltip = function () {
        // console.log(getOffset(target));

        // set width of tooltip to half of window width
        if (window.innerWidth < tooltip.offsetWidth * 1.5) {
            tooltip.style.maxWidth = window.innerWidth / 2;
        } else {
            tooltip.style.maxWidth = 340;
        }

        var pos_left = getOffset(target).left + (target.offsetWidth / 2) - (tooltip.offsetWidth / 2);
        var pos_top = getOffset(target).top - tooltip.offsetHeight - 10;

        // Landing
        var landingClassNames = ['background', 'active', 'shown'];
        if (landingClassNames.some(className => getOffset(target).parent.classList.contains(className))) {
            pos_top = (getOffset(target).top - tooltip.offsetHeight - 10) - ((getOffset(target).parent.offsetHeight * 12) / 100);
        }

        if (pos_left < 0) {
            pos_left = getOffset(target).left + target.offsetWidth / 2 - 20;
            tooltip.classList.add("left");
        } else {
            tooltip.classList.remove("left");
        }

        if (pos_left + tooltip.offsetWidth > window.innerWidth) {
            pos_left = getOffset(target).left - tooltip.offsetWidth + target.offsetWidth / 2 + 20;
            tooltip.classList.add("right");

            if (pos_left < 0) {
                pos_left = 10;
                tooltip.classList.add("left");
                tooltip.classList.remove("right");
            } else {
                tooltip.classList.remove("left");
            }
        } else {
            tooltip.classList.remove("right");
        }

        if (pos_top < 0) {
            pos_top = getOffset(target).top + target.offsetHeight + 15;
            tooltip.classList.add("top");
        } else {
            tooltip.classList.remove("top");
        }

        // adding "px" is very important
        tooltip.style.left = pos_left + "px";
        tooltip.style.top = pos_top + "px";
        tooltip.style.opacity = 1;
    };

    // Init
    init_tooltip();

    // Resize
    window.addEventListener("resize", init_tooltip);

    // Remove Tooltip
    var remove_tooltip = function () {
        tooltip.style.opacity = 0;
        document.querySelector("#tooltip") && document.body.removeChild(document.querySelector("#tooltip"));
        target.setAttribute("title", tip);
    };

    // Mouse Leave
    target.addEventListener("mouseleave", remove_tooltip);

    // Click
    tooltip.addEventListener("click", remove_tooltip);
}

// Init Selectize
var init_selectize = function (el, opt) {
    try {
        if (el && typeof $.fn.selectize === 'function') {
            var select = $(el).selectize(opt);
            if (select.length) {
                $(".selectize-input input").attr('readonly', 'readonly');
                return $(select)[0].selectize;
            }
        } else {
            console.log('⚠️ Selectize.js not available, falling back to regular select');
            return null;
        }
    } catch (error) {
        console.log('❌ Error initializing Selectize:', error);
        return null;
    }
}

// Selected Selectize
var selected_selectize = function (selectize, items = []) {
    if (items && items != '') return selectize.setValue(items, 1);
}

// Selectize Options
var selectize_options = function (opt) {
    if (opt) {
        return {
            maxItems: (opt.maxItems ? opt.maxItems : null),
            valueField: (opt.valueField ? opt.valueField : ''),
            labelField: (opt.labelField ? opt.labelField : ''),
            searchField: (opt.searchField ? opt.searchField : []),
            options: (opt.options ? opt.options : []),
            create: (opt.create ? opt.create : false),
            render: (opt.render ? opt.render : {})
        }
    }
}

// Guest Group Selection Options
var guest_group_selection_options = function (data) {
    if (data && data != '') {
        // Options
        var opt = {
            maxItems: 1,
            valueField: 'id',
            labelField: 'title',
            searchField: ['title', 'description'],
            options: (data ? data : []),
            render: {
                item: function (item, escape) {
                    return '<div>' + '<p>' + (item.title ? escape(item.title) : '(Tanpa Grup)') + '</p>' + '</div>';
                },
                option: function (item, escape) {
                    return '<div class="item">' +
                        '<p style="font-size: 14px;"><strong>' + (item.title ? escape(item.title) : '(Tanpa Grup)') + '</strong></p>' +
                        (item.description ? '<p style="font-size: 13px;">' + escape(item.description) + '</p>' : '') +
                        '</div>';
                }
            }
        }
        // Options
        return selectize_options(opt);
    }
}

// Guest Group Selection
var guest_group_selection = function (el, data = [], sel = [], callback = () => { }) {
    var options = guest_group_selection_options(data);
    // Element && Options was set
    if (el && options != '') {
        // Selectizing
        var selectize = init_selectize(el, options);
        if (selectize) {
            // Selected
            if (sel) {
                var selected = selected_selectize(selectize, sel);
            }

            // callback selectize
            callback(selectize)
        }
    }
}

// Main Event Selection Options
var main_event_selection_options = function (data) {
    if (data && data != '') {
        // Options
        var opt = {
            maxItems: 1,
            valueField: 'id',
            labelField: 'title',
            searchField: ['title', 'description'],
            options: (data ? data : []),
            render: {
                item: function (item, escape) {
                    return '<div>' + '<p>' + (item.title ? escape(item.title) : '(Pilih Acara Utama)') + '</p>' + '</div>';
                },
                option: function (item, escape) {
                    return '<div class="item">' +
                        '<p style="font-size: 14px;"><strong>' + (item.title ? escape(item.title) : '(Pilih Acara Utama)') + '</strong></p>' +
                        (item.description ? '<p style="font-size: 13px;">' + escape(item.description) + '</p>' : '') +
                        '</div>';
                }
            }
        }
        // Options
        return selectize_options(opt);
    }
}

// Main Event Selection
var main_event_selection = function (el, data = [], sel = [], callback = () => { }) {
    try {
        var options = main_event_selection_options(data);
        // Element && Options was set
        if (el && options != '') {
            // Selectizing
            var selectize = init_selectize(el, options);
            if (selectize) {
                // Selected
                if (sel) {
                    var selected = selected_selectize(selectize, sel);
                }

                // callback selectize
                callback(selectize)
            } else {
                // Fallback: populate options manually if Selectize fails
                console.log('⚠️ Selectize failed, using fallback for main_event select');
                populateSelectOptions(el, data, sel);
                callback(null);
            }
        }
    } catch (error) {
        console.log('❌ Error in main_event_selection:', error);
        // Fallback: populate options manually
        populateSelectOptions(el, data, sel);
        callback(null);
    }
}

// Fallback function to populate select options manually
var populateSelectOptions = function (el, data = [], sel = '') {
    try {
        if (!el) return;

        var $el = $(el);
        $el.find('option:not(:first)').remove(); // Clear existing options except first

        if (data && data.length > 0) {
            data.forEach(function (option) {
                var isSelected = option.selected ? ' selected' : '';
                $el.append('<option value="' + option.id + '"' + isSelected + '>' + option.title + '</option>');
            });
        } else {
            $el.append('<option value="">No events available</option>');
        }

        // Set selected value
        if (sel) {
            $el.val(sel);
        }
    } catch (error) {
        console.log('❌ Error in populateSelectOptions:', error);
    }
}

// Counter
var counter = function (count, bar = null) {
    if (count.length) {
        if (count.length == -1 && count.text && count.element) {
            return $(count.element).text(count.text);
        }

        var width = 0;
        var step = count.length > 0 ? Math.ceil(count.length / 200) : 10;
        var interval = setInterval(begin, step);
        var suffix = count.suffix ? count.suffix : '';

        // Begin
        function begin() {
            // Bar Element && Bar length
            if (bar && bar.element && bar.length) {
                // $(bar.element).text(bar.length);
                $(bar.element).css('width', ((width * 100) / bar.length) + '%');
            }

            // Count Element
            if (count.element) {
                $(count.element).text(thousands(width) + suffix);
            }

            if (width >= count.length) {
                clearInterval(interval);
            } else {
                width++;
            }
        }
    }
}

// Formatting number to thousands
function thousands(value) {
    if (value == null) return "0"; // handle null/undefined

    // Ubah ke string, buang koma & titik
    let str = String(value).replace(/[.,]/g, '');
    if (str === "" || isNaN(str)) return "0";

    // Format ribuan
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Textarea Height
var textarea_height = function () {
    // reset height
    $(this).css('height', `1px`)

    let height = $(this).prop('scrollHeight')
    let minHeight = $(this).css('minHeight') || ''

    // replace height
    if (minHeight && height < minHeight) height = minHeight

    // parsing integer
    height = 0 + parseInt(height)

    // apply height
    $(this).css('height', `${height}px`)
}

// Go To
var goto = function (page) {
    return window.location.href = page;
}

// Go To Handler
var goto_handler = function (e) {
    e.preventDefault();
    var page = $(this).attr('data-goto');
    if (page) return goto(page);
}

// Go To Handler
var goto_calculator = function (e) {
    e.preventDefault();

    var redirect = $(this).attr('href');
    if (!redirect) redirect = '../media/core/v2/package';

    // Form Step
    var formStepGuest = {
        origin: redirect,
        prev: redirect,
        next: redirect,
        current: '',
        label: 'Calculator',
        updatedAt: new Date()
    }

    // form Step
    window.localStorage.setItem('formStep:guest', JSON.stringify(formStepGuest));

    // Redirect -> Calculator
    window.open(redirect);
}


// Dropdown Button
var dropdown_toggle = function (e) {
    e.preventDefault();
    e.stopPropagation();
    return $(this).next('.dropdown-content').addClass('show');
}

// Hide Dropdown
var hide_dropdown = function () {
    var dropdownContent = $('.dropdown-content');
    if (dropdownContent.length && $(dropdownContent).hasClass('show')) return $(dropdownContent).removeClass('show');
}

// Init Tab
var init_tab = function (parent = '') {
    var navs = $('[data-tab-content]');
    for (var i = 0; i < navs.length; i++) {
        if (parent != '' && $(navs[i]).closest(parent).length && $(navs[i]).hasClass('active')) $(navs[i]).trigger('click');
        if (parent == '' && $(navs[i]).hasClass('active')) $(navs[i]).trigger('click');
    }
}

// Tab Content Toggle
var tab_content_toggle = function (e) {
    e.preventDefault();
    var wrapper = $(this).attr('data-tab-wrapper');
    var target = $(this).attr('data-tab-content');

    // Navs
    var navs = $('[data-tab-content]');
    for (var i = 0; i < navs.length; i++) {
        if ($(navs[i]).attr('data-tab-wrapper') == wrapper) {
            $(navs[i]).removeClass('active');
            $($(navs[i]).attr('data-tab-content')).hide();
        }
    }

    $(this).addClass('active');
    if ($(target).css('display') == 'none') $(target).show();
}

// Animate CSS
var animateCSS = function (element, animation, speed = '', prefix = 'animate__') {
    // We create a Promise and return it
    return new Promise((resolve, reject) => {
        const animationInit = `${prefix}animated`;
        const animationSpeed = (speed != '' ? `${prefix}${speed}` : '');
        const animationName = `${prefix}${animation}`;

        const node = document.querySelector(element);
        // node.classList.add(animationInit, animationName, animationSpeed);

        $(element).addClass(animationInit + " " + animationName + " " + animationSpeed)

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            // node.classList.remove(animationInit, animationName, animationSpeed);

            $(element).removeClass(animationInit + " " + animationName + " " + animationSpeed)
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}

// Viewport
function getViewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }

    return { width: e[a + 'Width'], height: e[a + 'Height'] };
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

// is valid date
function isValidDate(date) {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate) && parsedDate.toString() !== 'Invalid Date';
}

// download file
async function downloadFile(url, filename) {
    try {
        const response = await fetch(url);              // fetch content
        const blob = await response.blob();             // fetched file
        const link = document.createElement('a');       // create an anchor
        const urlBlob = URL.createObjectURL(blob);      // create an object

        link.href = urlBlob;                    // set link
        link.download = filename;               // set file name
        document.body.appendChild(link);        // append element to body
        link.click();                           // trigger click action

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);    // remove element from body
            URL.revokeObjectURL(urlBlob);       // remove object
        }, 100);
    } catch (error) {
        console.error('Download failed:', error);
    }
}


/*  ===========================
        EVENT LISTENER
========================== */

// Close Modal
$(document).on('click', '.close-modal', closeModal);

// Close Stacked Modal
$(document).on('click', '.close-stacked-modal', closeStackedModal);

// Close Alert
$(document).on('click', '.alert-close', hideAlert);

// Wa Chat Send Button
$(document).on('click', '#wa-chat-send-button', wa_chat_toggle);

// Close Wa Widget
$(document).on('click', '#close-wa-widget', wa_chat_trigger);

// Generate Tooltip
$(document).on('mouseenter', '[rel="tooltip"]', generate_tooltip);

// Textarea Height
$(document).on('keyup focus focusout', 'textarea', textarea_height);

// [Data Copy]
$(document).on('click', '[data-copy]', copy_text);

// Go To
$(document).on('click', '[data-goto]', goto_handler);

// Go To Calculator
$(document).on('click', '.goto-calculator', goto_calculator);

// Dropdown Toggle
$(document).on('click', '.dropdown-btn', dropdown_toggle);

// Tab Content
$(document).on('click', '[data-tab-content]', tab_content_toggle);


// Accordion Toggle
var accordion_toogle = function (e) {
    e.preventDefault();

    var wrapper = $(this).closest('.accordion');
    var item = $(this).closest('.accordion-item');

    if (wrapper && wrapper.length && item && item.length) {

        var isItemShow = false;
        if ($(item).hasClass('show')) isItemShow = true;

        // Accordion Items
        var items = $(wrapper).find('.accordion-item');
        for (var i = 0; i < items.length; i++) {
            // Close Accordion
            if ($(items[i]).hasClass('show')) {
                $(items[i]).removeClass('show');
                $(items[i]).find('.accordion-panel').removeClass('show').slideUp();
            }
        }

        // Show Accordion
        if (!isItemShow) {
            $(item).addClass('show');
            $(item).find('.accordion-panel').addClass('show').slideDown();
        }

        // Close Accordion
        if (isItemShow) {
            $(item).removeClass('show');
            $(item).find('.accordion-panel').removeClass('show').slideUp();
        }

    }
}

// Accordion On Click
$(document).on('click', '.accordion-label', accordion_toogle);


// Key Down
$(document).on('keydown', function (e) {
    // Escape
    // escape key maps to keycode `27`
    if (e.key === "Escape") {
        // when you have content inside your stacked modal
        if ($('#stackedModal').children().length) {
            closeStackedModal(); // closing stacked modal
        } else {
            // when you have content inside your modal
            if ($('#modal').children().length) {
                closeModal(); // closing modal
            }
        }
    }
});


// Nprogress
if (typeof NProgress !== 'undefined') {
    // Show the progress bar 
    NProgress.start();

    // Increase randomly
    var nprogressInterval = setInterval(function () { NProgress.inc(); }, 1000);

    // Trigger finish when page fully loaded
    $(window).on('load', function () {
        clearInterval(nprogressInterval);
        NProgress.done();
    });

    // Trigger bar when exiting the page
    $(window).on('unload', function () { NProgress.start(); });

    // Ajax Start
    $(document).ajaxStart(function () { NProgress.start(); });

    // Ajax Stop
    $(document).ajaxStop(function () { NProgress.done(); });
}


/*  ===========================
        ON READY
========================== */
$(document).ready(function () {

    // Init Tab
    setTimeout(init_tab, 500);

    // Window on Click
    $(window).on('click', function (e) {
        // Hide Dropdown
        if (!$(e.target).closest('.dropdown-btn, .dropdown-body.filter-col').length) {
            hide_dropdown();
        }
    })


    // Check if 'pickadate' exists
    if ($.fn.pickadate) {
        // Extend the default picker options for all instances.
        $.extend($.fn.pickadate.defaults, {
            // Strings and Translations
            monthsFull: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
            weekdaysFull: ["Minggu", "Senin", "Selasa", "Rabu", "kamis", "Jum'at", "Sabtu"],
            weekdaysShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],

            // Buttons
            today: 'Hari Ini',
            clear: 'Hapus',
            close: 'Tutup',

            // Formats
            formatSubmit: 'yyyy-mm-dd',
            format: 'dddd, dd mmmm yyyy'
        });
    }

    // Check if 'pickatime' exists
    if ($.fn.pickatime) {
        // Extend the default picker options for all instances.
        $.extend($.fn.pickatime.defaults, {
            // Translations and clear button
            clear: '',

            // Formats
            format: 'HH:i',
            formatSubmit: 'HH:i',

            // Time intervals
            interval: 15,
        });
    }
});

// Global Admin Delete Handler
$(document).on('click', '.delete-btn', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation(); // Prevent template.js from triggering a refresh
    const commentId = $(this).data('comment');
    if (commentId && window.MockBackend) {
        window.MockBackend.deleteWish(commentId, this);
    }
    return false;
});

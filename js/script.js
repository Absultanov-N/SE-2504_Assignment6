/**
 * Qazaq Heritage - Assignment 6: jQuery Integration & Interactive Features
 * Team: Toleumuratova Aisamal & Absultanov Nurdaulet (Group SE-2504)
 */

$(document).ready(function () {

    // ==========================================
    // Task 0. Setup & Readiness Test
    // ==========================================
    console.log("jQuery is ready!");


    // ==========================================
    // Part 1. jQuery Search Features
    // ==========================================

    // Task 1: Real-time Search and Live Filter for Cards
    $('#searchInput').on('keyup', function () {
        const value = $(this).val().toLowerCase().trim();
        $('.heritage-card-item').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Task 2: Autocomplete Search Suggestions
    const searchSuggestions = [
        "Mausoleum of Khoja Ahmed Yasawi",
        "Kazakh Yurt (Киіз үй)",
        "Tamgaly Petroglyphs",
        "Charyn Canyon",
        "Burabay National Park",
        "Katon-Karagay Mountains",
        "Mangystau Landscapes",
        "Qobyz and Dombra"
    ];

    $('#searchInput').on('input', function () {
        const query = $(this).val().toLowerCase().trim();
        const $suggestionBox = $('#suggestionBox');
        $suggestionBox.empty();

        if (query.length === 0) {
            $suggestionBox.hide();
            return;
        }

        const matches = searchSuggestions.filter(item => item.toLowerCase().includes(query));

        if (matches.length > 0) {
            matches.forEach(match => {
                $suggestionBox.append(`<li class="list-group-item suggestion-item" style="cursor:pointer;">${match}</li>`);
            });
            $suggestionBox.show();
        } else {
            $suggestionBox.hide();
        }
    });

    // Select suggestion on click
    $(document).on('click', '.suggestion-item', function () {
        const selectedText = $(this).text();
        $('#searchInput').val(selectedText).trigger('keyup');
        $('#suggestionBox').hide();
    });

    // Hide suggestions on click outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#searchInput, #suggestionBox').length) {
            $('#suggestionBox').hide();
        }
    });

    // Task 3: Search Highlighting in FAQ
    $('#faqSearchInput').on('keyup', function () {
        const keyword = $(this).val().trim();
        const $faqContainer = $('.faq-container');

        // Clear previous highlights
        $faqContainer.find('mark.highlight').each(function () {
            $(this).replaceWith($(this).text());
        });

        if (keyword.length > 0) {
            // Escape user input so characters such as (, [, *, and \\ are treated literally.
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedKeyword})`, 'gi');
            $faqContainer.find('.faq-question, .faq-answer, .accordion-button, .accordion-body').each(function () {
                // Highlight only text nodes; do not rewrite HTML attributes or nested markup.
                const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, {
                    acceptNode(node) {
                        if (!node.nodeValue.trim() || node.parentElement.closest('mark, script, style')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                });
                const textNodes = [];
                while (walker.nextNode()) textNodes.push(walker.currentNode);

                textNodes.forEach(node => {
                    if (!regex.test(node.nodeValue)) {
                        regex.lastIndex = 0;
                        return;
                    }
                    regex.lastIndex = 0;
                    const fragment = document.createDocumentFragment();
                    let lastIndex = 0;
                    node.nodeValue.replace(regex, (match, _group, offset) => {
                        fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, offset)));
                        const mark = document.createElement('mark');
                        mark.className = 'highlight bg-warning text-dark px-1 rounded';
                        mark.textContent = match;
                        fragment.appendChild(mark);
                        lastIndex = offset + match.length;
                        return match;
                    });
                    fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
                    node.parentNode.replaceChild(fragment, node);
                });
            });
        }
    });


    // ==========================================
    // Part 2. UX Engagement Elements with jQuery
    // ==========================================

    // Task 4: Scroll Progress Bar
    $(window).on('scroll', function () {
        const scrollTop = $(window).scrollTop();
        const docHeight = $(document).height() - $(window).height();
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        $('#scrollProgressBar').css('width', scrollPercent + '%');
    });
    // Set the correct value immediately (including when the browser restores scroll position).
    $(window).trigger('scroll');

    // Task 5: Animated Number Counter
    let counterStarted = false;
    $(window).on('scroll', function () {
        const $counterSection = $('#statsSection');
        if ($counterSection.length && !counterStarted) {
            const oTop = $counterSection.offset().top - window.innerHeight;
            if ($(window).scrollTop() > oTop) {
                $('.stat-number').each(function () {
                    const $this = $(this);
                    const countTo = parseInt($this.attr('data-count'), 10);
                    $({ countNum: $this.text() }).animate({
                        countNum: countTo
                    }, {
                        duration: 2000,
                        easing: 'swing',
                        step: function () {
                            $this.text(Math.floor(this.countNum));
                        },
                        complete: function () {
                            $this.text(this.countNum + '+');
                        }
                    });
                });
                counterStarted = true;
            }
        }
    });

    // Task 6: Loading Spinner on Submit (Forms)
    $('#subscriptionForm, #contactForm').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        
        // Native browser check for validity if standard fields exist
        if (this.checkValidity && !this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const $submitBtn = $form.find('button[type="submit"]');
        const originalText = $submitBtn.html();

        // Show spinner and disable button
        $submitBtn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Please wait...
        `);

        // Simulate server request delay (1.8s)
        setTimeout(function () {
            $submitBtn.prop('disabled', false).html(originalText);
            showToast("Form submitted successfully!");
            $form[0].reset();

            if ($('#subscriptionModal').is(':visible')) {
                closeModal();
            }
        }, 1800);
    });


    // ==========================================
    // Part 3. Web App Functionality
    // ==========================================

    // Task 7: Temporary Toast Notification System
    window.showToast = function (message) {
        let $toast = $('#customToast');
        if (!$toast.length) {
            $('body').append(`
                <div id="customToast" class="toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 p-3 m-3 shadow-lg" style="z-index: 1055; display:none;" role="alert">
                    <div class="d-flex">
                        <div class="toast-body fw-semibold" id="toastMessage"></div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="$('#customToast').fadeOut()"></button>
                    </div>
                </div>
            `);
            $toast = $('#customToast');
        }
        $('#toastMessage').text(message);
        $toast.stop(true, true).fadeIn(300).delay(3000).fadeOut(400);
    };

    // Task 8: Copied to Clipboard Button
    $(document).on('click', '.copy-btn', function () {
        const $btn = $(this);
        const textToCopy = $btn.siblings('.copy-text').text().trim();

        const originalText = $btn.html();
        const showCopiedState = function () {
            $btn.html('✔ Copied!').addClass('btn-success').removeClass('btn-outline-primary btn-outline-secondary');
            showToast("Copied link to clipboard!");
            setTimeout(function () {
                $btn.html(originalText).removeClass('btn-success');
                if (originalText.toLowerCase().includes('copy')) {
                    $btn.addClass('btn-outline-primary');
                }
            }, 2000);
        };

        const fallbackCopy = function () {
            const $temp = $('<textarea>')
                .val(textToCopy)
                .attr({ 'aria-hidden': 'true', tabindex: '-1' })
                .css({ position: 'fixed', opacity: 0, left: '-9999px', top: '0' })
                .appendTo('body');
            $temp[0].focus();
            $temp[0].select();
            let copied = false;
            try {
                copied = document.execCommand('copy');
            } catch (error) {
                copied = false;
            }
            $temp.remove();
            if (copied) {
                showCopiedState();
            } else {
                showToast("Copy failed. Please copy the link manually.");
            }
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy)
                .then(showCopiedState)
                .catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    });

    // Task 9: Image Lazy Loading
    function lazyLoadImages() {
        $('img.lazy-img').each(function () {
            const $img = $(this);
            const dataSrc = $img.attr('data-src');

            if (!dataSrc) return;

            const imageTop = $img.offset().top;
            const windowBottom = $(window).scrollTop() + $(window).height();

            if (imageTop < windowBottom + 150) {
                $img.attr('src', dataSrc).removeAttr('data-src').hide().fadeIn(500);
            }
        });
    }

    $(window).on('scroll resize', lazyLoadImages);
    lazyLoadImages();


    // ==========================================
    // Assignment 5 Core Features & Controls
    // ==========================================

    // Live Date & Time Display
    const dateTimeElement = document.getElementById('dateTimeDisplay');
    if (dateTimeElement) {
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });
        const updateDateTime = () => {
            dateTimeElement.textContent = formatter.format(new Date());
        };
        updateDateTime();
        window.setInterval(updateDateTime, 1000);
    }

    // Background Theme Color Cycler
    const colorBtn = document.getElementById('changeBgBtn');
    const colors = ['#F7F5F0', '#EAE7DC', '#D8C3A5', '#E8A87C', '#C38D9E', '#E27D60'];
    let colorIndex = 0;
    if (colorBtn) {
        colorBtn.addEventListener('click', () => {
            colorIndex = (colorIndex + 1) % colors.length;
            document.body.style.setProperty('--page-background', colors[colorIndex]);
        });
    }

    // Night Mode Theme Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isNight = document.body.classList.toggle('night-theme');
            themeToggleBtn.textContent = isNight ? 'Switch to Day Mode' : 'Switch to Night Mode';
            themeToggleBtn.setAttribute('aria-pressed', String(isNight));
        });
    }

    // FAQ Accordion Transition
    $('.faq-question').on('click', function () {
        const $item = $(this).closest('.faq-item');
        const $answer = $item.find('.faq-answer');

        if ($answer.length) {
            const isOpen = $(this).attr('aria-expanded') === 'true';

            $('.faq-question').attr('aria-expanded', 'false');
            $('.faq-answer').css({ 'max-height': '0px', 'opacity': '0' }).attr('aria-hidden', 'true');

            if (!isOpen) {
                $(this).attr('aria-expanded', 'true');
                $answer.attr('aria-hidden', 'false').css({
                    'max-height': $answer[0].scrollHeight + 'px',
                    'opacity': '1'
                });
            }
        }
    });

    // Subscription Modal Controls
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('subscriptionModal');

    function openModal() {
        if (!modalOverlay) return;
        modalOverlay.style.display = 'flex';
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.style.display = 'none';
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    if (openModalBtn && modalOverlay) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.style.display === 'flex') closeModal();
        });
    }

    // Web Audio API Interface Click Sounds
    const interfaceSoundsToggleBtn = document.getElementById('interfaceSoundsToggleBtn');
    let interfaceSoundsEnabled = false;
    let interfaceAudioContext = null;

    if (interfaceSoundsToggleBtn) {
        interfaceSoundsToggleBtn.addEventListener('click', () => {
            interfaceSoundsEnabled = !interfaceSoundsEnabled;
            interfaceSoundsToggleBtn.textContent = `Interface Sounds ${interfaceSoundsEnabled ? 'ON' : 'OFF'}`;
            interfaceSoundsToggleBtn.setAttribute('aria-pressed', String(interfaceSoundsEnabled));
        });
    }

    document.addEventListener('click', (event) => {
        if (!interfaceSoundsEnabled) return;
        const interactiveElement = event.target.closest('button, a, select, summary, input[type="checkbox"], input[type="radio"]');
        if (!interactiveElement || interactiveElement.id === 'interfaceSoundsToggleBtn' ||
            interactiveElement.id === 'soundEffectBtn' || interactiveElement.closest('.heritage-audio-player')) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!interfaceAudioContext) interfaceAudioContext = new AudioContextClass();

        const oscillator = interfaceAudioContext.createOscillator();
        const gain = interfaceAudioContext.createGain();

        oscillator.frequency.value = 520;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.04, interfaceAudioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, interfaceAudioContext.currentTime + 0.06);

        oscillator.connect(gain);
        gain.connect(interfaceAudioContext.destination);

        oscillator.start();
        oscillator.stop(interfaceAudioContext.currentTime + 0.06);
    });

    // Heritage Category Filtering
    const heritageItems = [
        { title: 'Khoja Ahmed Yasawi Mausoleum', category: 'architecture', image: 'images/yasawi.jpg', description: 'A landmark of medieval architecture in Turkistan.' },
        { title: 'Kazakh Yurt', category: 'traditions', image: 'images/yurt.jpg', description: 'A portable dwelling designed for a nomadic way of life.' },
        { title: 'Tamgaly Petroglyphs', category: 'history', image: 'images/tamgaly.jpg', description: 'Rock carvings that preserve traces of ancient life.' },
        { title: 'Burabay', category: 'nature', image: 'images/burabay.jpg', description: 'A landscape known for its lakes, forests, and rock formations.' },
        { title: 'Kazakh Traditions', category: 'traditions', image: 'images/kazakh_culture.jpg', description: 'Cultural practices passed between generations.' },
        { title: 'Katon-Karagay', category: 'nature', image: 'images/extra/katon-karagay.jpg', description: 'Mountain landscapes, forests, and lakes of eastern Kazakhstan.' },
        { title: 'Charyn Canyon', category: 'nature', image: 'images/extra/sharyn-canyon.jpg', description: 'A dramatic canyon shaped by natural erosion.' }
    ];

    const heritageFilter = document.getElementById('heritageFilter');
    const heritageResults = document.getElementById('heritageResults');

    function renderHeritageItems(items) {
        if (!heritageResults) return;
        heritageResults.innerHTML = '';
        items.forEach(item => {
            const cardHtml = `
                <div class="col heritage-card-item">
                    <article class="card heritage-result-card shadow-sm border-0 h-100">
                        <img src="${item.image}" class="card-img-top object-fit-cover" alt="${item.title}" style="height:200px;">
                        <div class="card-body">
                            <p class="small text-primary text-uppercase fw-bold mb-1">${item.category}</p>
                            <h5 class="card-title fw-bold">${item.title}</h5>
                            <p class="card-text text-muted small">${item.description}</p>
                        </div>
                    </article>
                </div>
            `;
            heritageResults.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    if (heritageFilter && heritageResults) {
        heritageFilter.addEventListener('change', () => {
            const cat = heritageFilter.value;
            const filtered = cat === 'all' ? heritageItems : heritageItems.filter(i => i.category === cat);
            renderHeritageItems(filtered);
        });
        renderHeritageItems(heritageItems);
    }

    // Gallery Interactive Thumbnails
    $('.heritage-thumbnail').on('click', function () {
        const newImg = $(this).attr('data-image');
        const caption = $(this).attr('data-caption');

        $('#featuredHeritageImage').attr('src', newImg).attr('alt', caption);
        $('#featuredHeritageCaption').text(caption);
        $('#imageExplorerStatus').text(`Showing ${caption}.`);

        $('.heritage-thumbnail').removeClass('is-selected').attr('aria-pressed', 'false');
        $(this).addClass('is-selected').attr('aria-pressed', 'true');
    });

});

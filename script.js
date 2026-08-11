// MENU TABS
function mTab(btn, id) {
    document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mpanel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(id).classList.add('active');
}

// CHEESE FILTER
function filterCheese(category, btn) {
    document.querySelectorAll('.cheese-filter button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.cheese-card').forEach(card => {
        if (category === 'all' || card.dataset.category.includes(category)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// HERO CAROUSEL
let heroSlideIndex = 0;
const heroSlides = document.querySelectorAll('#hero .carousel-slide');
const heroIndicators = document.querySelectorAll('#hero .carousel-indicator');
let heroInterval;

function startHeroAutoPlay() {
    stopHeroAutoPlay();
    heroInterval = setInterval(() => moveHeroSlide(1), 5000);
}
function stopHeroAutoPlay() { if (heroInterval) clearInterval(heroInterval); }
function updateHeroCarousel(index) {
    heroSlides.forEach(slide => slide.classList.remove('current-slide'));
    heroIndicators.forEach(ind => ind.classList.remove('active'));
    heroSlides[index].classList.add('current-slide');
    heroIndicators[index].classList.add('active');
}
function moveHeroSlide(direction) {
    heroSlideIndex += direction;
    if (heroSlideIndex < 0) heroSlideIndex = heroSlides.length - 1;
    else if (heroSlideIndex >= heroSlides.length) heroSlideIndex = 0;
    updateHeroCarousel(heroSlideIndex);
    startHeroAutoPlay();
}
function setHeroSlide(index) {
    heroSlideIndex = index;
    updateHeroCarousel(heroSlideIndex);
    startHeroAutoPlay();
}
startHeroAutoPlay();

// ABOUT CAROUSEL
let aboutSlideIndex = 0;
const aboutSlides = document.querySelectorAll('#about .carousel-slide');
const aboutIndicators = document.querySelectorAll('#about .carousel-indicator');
let aboutInterval;

function startAboutAutoPlay() {
    stopAboutAutoPlay();
    aboutInterval = setInterval(() => moveAboutSlide(1), 5000);
}
function stopAboutAutoPlay() { if (aboutInterval) clearInterval(aboutInterval); }
function updateAboutCarousel(index) {
    aboutSlides.forEach(slide => slide.classList.remove('current-slide'));
    aboutIndicators.forEach(ind => ind.classList.remove('active'));
    aboutSlides[index].classList.add('current-slide');
    aboutIndicators[index].classList.add('active');
}
function moveAboutSlide(direction) {
    aboutSlideIndex += direction;
    if (aboutSlideIndex < 0) aboutSlideIndex = aboutSlides.length - 1;
    else if (aboutSlideIndex >= aboutSlides.length) aboutSlideIndex = 0;
    updateAboutCarousel(aboutSlideIndex);
    startAboutAutoPlay();
}
function setAboutSlide(index) {
    aboutSlideIndex = index;
    updateAboutCarousel(aboutSlideIndex);
    startAboutAutoPlay();
}
startAboutAutoPlay();

// HAMBURGER MENU MOBILE
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        // Cambia l'icona da ☰ a ✕
        menuToggle.textContent = navLinks.classList.contains('nav-open') ? '✕' : '☰';
    });

    // Chiudi il menu se clicco su un link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-open');
            menuToggle.textContent = '☰';
        });
    });
}
// OPEN/CLOSED STATUS
function updateOpenStatus() {
    // Fuso orario del Regno Unito (London)
    const now = new Date();
    const ukTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/London' });
    const ukDate = new Date(ukTimeStr);

    const day = ukDate.getDay(); // 0=Sun, 1=Mon, 2=Tue...
    const hours = ukDate.getHours();
    const minutes = ukDate.getMinutes();
    const currentTime = hours * 60 + minutes;

    let isOpen = false;

    // Monday (1) & Sunday (0): Closed

    // Tuesday - Thursday (2-4): 12:30 (750) - 23:00 (1380)
    if (day >= 2 && day <= 4) {
        if (currentTime >= 750 && currentTime < 1380) isOpen = true;
    }
    // Friday - Saturday (5-6): 12:30 (750) - 23:30 (1410)
    else if (day === 5 || day === 6) {
        if (currentTime >= 750 && currentTime < 1410) isOpen = true;
    }

    const statusEl = document.getElementById('openStatus');
    const textEl = document.getElementById('statusText');

    if (isOpen) {
        statusEl.classList.add('open');
        statusEl.classList.remove('closed');
        textEl.textContent = 'Open Now';
    } else {
        statusEl.classList.add('closed');
        statusEl.classList.remove('open');
        textEl.textContent = 'Closed';
    }
}
updateOpenStatus();
setInterval(updateOpenStatus, 60000);

// SCROLL REVEAL ANIMATIONS
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// RESERVATION
const todayStr = new Date().toISOString().split('T')[0];
document.getElementById('bookDate').setAttribute('min', todayStr);

// --- GESTIONE DINAMICA ORARI MODULO PRENOTAZIONE ---
const bookDateInput = document.getElementById('bookDate');
const bookTimeInput = document.getElementById('bookTime');

// Funzione per convertire l'ora in formato 12h UK (es. 2:30 PM)
function formatToUKTime(hours, minutes) {
    let period = hours >= 12 ? 'PM' : 'AM';
    let displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

function populateTimeSlots(day) {
    // Resetta il menu a tendina
    bookTimeInput.innerHTML = '<option value="" disabled selected>Select time</option>';

    // Imposta l'ultimo slot disponibile (22:30 per Tue-Thu, 23:00 per Fri-Sab)
    let lastSlotHour = 22;

    if (day === 5 || day === 6) { // Venerdì (5) o Sabato (6)
        lastSlotHour = 23;
    }

    // Genera gli slot ogni 30 minuti
    for (let h = 12; h <= lastSlotHour; h++) {
        let startMin = (h === 12) ? 30 : 0; // Il martedì inizia alle 12:30

        for (let m = startMin; m < 60; m += 30) {
            // Se siamo all'ultima ora consentita e sono le :30, interrompi (es. non mostrare 23:30)
            if (h === lastSlotHour && m === 30) break;

            let timeValue = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            let timeLabel = formatToUKTime(h, m);

            let option = document.createElement('option');
            option.value = timeValue;
            option.textContent = timeLabel;
            bookTimeInput.appendChild(option);
        }
    }
}

if (bookDateInput) {
    bookDateInput.addEventListener('change', function () {
        const selectedDate = new Date(this.value + 'T00:00:00'); // Aggiunge T00:00:00 per evitare fusi orari
        const day = selectedDate.getDay(); // 0=Dom, 1=Lun, 2=Mar...

        // Blocca Domenica (0) e Lunedì (1)
        if (day === 0 || day === 1) {
            alert('We are closed on Sundays and Mondays. Please select a valid date (Tue-Sat).');
            this.value = ''; // Pulisce il campo data
            bookTimeInput.innerHTML = '<option value="" disabled selected>Select date first</option>';
            return;
        }

        // Se è un giorno valido (Mar-Sab), popola gli orari corretti
        populateTimeSlots(day);
    });
}

async function handleReservation(event) {
    event.preventDefault();

    const btn = event.target.querySelector('button[type="submit"]');
    const feedback = document.getElementById('bookingFeedback');

    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        date: document.getElementById('bookDate').value,
        time: document.getElementById('bookTime').value,
        guests: document.getElementById('bookGuests').value,
        phone: document.getElementById('bookPhone').value,
        email: document.getElementById('bookEmail').value,
        notes: document.getElementById('bookNotes').value,
    };

    try {
        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            feedback.style.display = 'block';
            event.target.reset();
            document.getElementById('bookDate').setAttribute('min', todayStr);
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            btn.textContent = 'Confirm Reservation';
            btn.disabled = false;
        } else {
            throw new Error();
        }
    } catch {
        btn.textContent = 'Something went wrong — please call us';
        btn.disabled = false;
    }
}

// NEWSLETTER
function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input');
    const originalText = form.querySelector('button').textContent;
    form.querySelector('button').textContent = '✓ Subscribed!';
    input.value = '';
    setTimeout(() => {
        form.querySelector('button').textContent = originalText;
    }, 3000);
}

// --- COOKIE BANNER INFALLIBILE (ANTI-VERCEL FLASH) ---
(function () {
    // Controlla se non sono stati ancora accettati
    if (!localStorage.getItem('corkCookiesAccepted')) {

        // 1. Crea il div del banner da zero
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#1C1612; color:#F5F0E8; padding:15px 5%; z-index:999999; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; border-top:1px solid rgba(245, 240, 232, 0.2); display:flex;';

        // 2. Inserisci il testo e il bottone
        banner.innerHTML = `
          <p style="margin:0; font-size:14px; color:rgba(245, 240, 232, 0.8); font-family:Inter, sans-serif;">We use cookies to enhance your experience. <a href="privacy-policy.html" style="color:#B8933A; text-decoration:underline;">Privacy Policy</a></p>
          <button style="background:#B8933A; color:#1C1612; border:none; padding:10px 20px; font-family:Inter, sans-serif; font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:1px; cursor:pointer; border-radius:2px;">Accept</button>
        `;

        // 3. Gestisci il click direttamente nel JS
        banner.querySelector('button').addEventListener('click', function () {
            localStorage.setItem('corkCookiesAccepted', 'true');
            banner.style.display = 'none';
        });

        // 4. Attacca il banner alla pagina
        document.body.appendChild(banner);
    }
})();
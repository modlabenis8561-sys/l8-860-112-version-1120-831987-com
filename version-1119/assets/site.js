const normalizeText = (value) => (value || "").toString().toLowerCase().replace(/\s+/g, "");

function bindNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
        return;
    }
    toggle.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}

function bindHero() {
    const root = document.querySelector("[data-hero]");
    if (!root) {
        return;
    }
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    let index = 0;
    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle("active", current === index);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle("active", current === index);
        });
    };
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const next = Number(dot.getAttribute("data-hero-dot"));
            show(Number.isFinite(next) ? next : 0);
        });
    });
    window.setInterval(() => {
        show(index + 1);
    }, 5000);
}

function bindFilters() {
    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach((scope) => {
        const page = scope.closest("main") || document;
        const input = scope.querySelector("[data-card-search]");
        const type = scope.querySelector("[data-type-filter]");
        const cards = Array.from(page.querySelectorAll(".movie-card"));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        const apply = () => {
            const keyword = normalizeText(input ? input.value : "");
            const selectedType = type ? type.value : "";
            cards.forEach((card) => {
                const search = normalizeText(card.getAttribute("data-search"));
                const cardType = card.getAttribute("data-type") || "";
                const matchedKeyword = !keyword || search.includes(keyword);
                const matchedType = !selectedType || cardType === selectedType;
                card.classList.toggle("is-hidden", !(matchedKeyword && matchedType));
            });
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        if (type) {
            type.addEventListener("change", apply);
        }
        apply();
    });
}

async function attachStream(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
    }
    const module = await import("./hls.js");
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
    }
    video.src = url;
}

function bindPlayers() {
    const widgets = Array.from(document.querySelectorAll(".player-widget"));
    widgets.forEach((widget) => {
        const video = widget.querySelector("video");
        const button = widget.querySelector("[data-player-action='play']");
        const url = widget.getAttribute("data-hls");
        if (!video || !button || !url) {
            return;
        }
        let loading = false;
        const start = async () => {
            if (loading) {
                return;
            }
            loading = true;
            widget.classList.add("is-playing");
            if (!video.getAttribute("src") && !video._hlsInstance) {
                await attachStream(video, url);
            }
            try {
                await video.play();
            } catch (error) {
                widget.classList.remove("is-playing");
            } finally {
                loading = false;
            }
        };
        button.addEventListener("click", start);
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", () => {
            widget.classList.add("is-playing");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindNavigation();
    bindHero();
    bindFilters();
    bindPlayers();
});

document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        shimmerWave: document.getElementById("shimmerWave"),
        preloaderVideo: document.getElementById("preloaderVideo"),
        preloader: document.getElementById("preloader"),
        progressBarPreloader: document.getElementById("progressBar"),
        leftBlob: document.querySelector(".blob.left"),
        rightBlob: document.querySelector(".blob.right"),
        firstVideoContainer: document.getElementById("firstVideoContainer"),
        scrollVideo1: document.getElementById("scrollVideo1"),
        scrollDownButton: document.getElementById("scrollDownButton"),
        footer: document.getElementById("footer"),
        backToTopButton: document.getElementById("backToTopButton"),
        secondVideoContainer: document.getElementById("secondVideoContainer"),
        scrollVideo2: document.getElementById("scrollVideo2"),
        scrollUpButton: document.getElementById("scrollUpButton"),
        pageBar: document.querySelector('.page-bar-line')
    };
    const state = {
        footerVisible: false,
        lastScrollPosition: 0,
        isScrolling: false,
        scrollDirection: null,
        lastScrollTime: Date.now(),
        scrollTimeout: null,
        preloaderComplete: false
    };
    const videoConfig = {
        video1: {
            pausePoints: [1.4, 3.6, 9.5, 11, 13, 18, 23.2],
            currentIndex: 0,
            isPaused: false
        },
        video2: {
            pausePoints: [
                { time: 19, textId: "text-1" },
                { time: 28, textId: "text-2" },
                { time: 39, textId: "text-3" },
                { time: 43, textId: "text-4" },
                { time: 59, textId: "text-5" },
                { time: 66, textId: "text-6" }
            ],
            currentIndex: 0,
            isPaused: false
        }
    };
    function disableScroll() {
        document.body.style.overflow = "hidden";
    }
    function enableScroll() {
        document.body.style.overflow = "";
    }
    function splitTextToSpans(element) {
        if (!element) return;
        const text = element.textContent.trim();
        element.innerHTML = "";
        text.split("").forEach(char => {
            const span = document.createElement("span");
            span.textContent = char === " " ? "\u00A0" : char;
            element.appendChild(span);
        });
    }
    function smoothScrollTo(element, duration = 1000) {
        const targetPosition = element ? element.offsetTop : 0;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeInOutCubic = t => 
                t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            window.scrollTo(0, startPosition + (distance * easeInOutCubic(progress)));
            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                state.isScrolling = false;
            }
        }
        state.isScrolling = true;
        requestAnimationFrame(animation);
    }
    function animateBlobs() {
        if (elements.leftBlob && elements.rightBlob) {
            gsap.timeline({ repeat: -1, yoyo: true })
                .to(elements.leftBlob, { 
                    y: "-50vh", 
                    duration: 6, 
                    ease: "power1.inOut" 
                })
                .to(elements.leftBlob, { 
                    y: "50vh", 
                    duration: 6, 
                    ease: "power1.inOut" 
                });
            gsap.timeline({ repeat: -1, yoyo: true })
                .to(elements.rightBlob, { 
                    y: "50vh", 
                    duration: 6, 
                    ease: "power1.inOut" 
                })
                .to(elements.rightBlob, { 
                    y: "-50vh", 
                    duration: 6, 
                    ease: "power1.inOut" 
                });
        }
    }
    function startProgressBarPreloader() {
        if (!elements.preloaderVideo || !elements.progressBarPreloader) return;
        elements.preloaderVideo.addEventListener("timeupdate", () => {
            const progress = (elements.preloaderVideo.currentTime / elements.preloaderVideo.duration) * 100;
            elements.progressBarPreloader.style.width = `${progress}%`;
        });
        elements.preloaderVideo.addEventListener("ended", () => {
            gsap.to(elements.preloader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    elements.preloader.style.display = "none";
                    enableScroll();
                    handleFirstVideo();
                    state.preloaderComplete = true;
                }
            });
        });
    }
    function animatePreloaderText() {
        if (!elements.shimmerWave) return;
        splitTextToSpans(elements.shimmerWave);
        gsap.timeline()
            .to("#shimmerWave span", {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05
            })
            .to("#shimmerWave", {
                scale: 0.5,
                y: -window.innerHeight,
                duration: 1,
                ease: "power3.in",
                onComplete: () => {
                    gsap.to(elements.preloaderVideo, {
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        onStart: () => {
                            elements.preloaderVideo.classList.remove("hidden");
                            elements.preloaderVideo.play();
                        },
                        onComplete: startProgressBarPreloader
                    });
                }
            });
    }
    function showScrollDownButton() {
        elements.scrollDownButton?.classList.add("visible");
    }
    function hideScrollDownButton() {
        elements.scrollDownButton?.classList.remove("visible");
    }
    function resetVideoState() {
        videoConfig.video1.currentIndex = 0;
        videoConfig.video2.currentIndex = 0;
        videoConfig.video1.isPaused = false;
        videoConfig.video2.isPaused = false;
        if (elements.scrollVideo1) elements.scrollVideo1.currentTime = 0;
        if (elements.scrollVideo2) elements.scrollVideo2.currentTime = 0;
        document.querySelectorAll('.text').forEach(element => {
            element.style.display = 'none';
            element.style.opacity = '0';
        });
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = '0';
        });
    }
    function handleFirstVideo() {
        if (!elements.scrollVideo1) return;
        elements.scrollVideo1.play();
        elements.scrollVideo1.addEventListener("timeupdate", () => {
            const currentPoint = videoConfig.video1.pausePoints[videoConfig.video1.currentIndex];
            if (currentPoint && 
                elements.scrollVideo1.currentTime >= currentPoint && 
                !videoConfig.video1.isPaused) {
                elements.scrollVideo1.pause();
                videoConfig.video1.isPaused = true;
                showScrollDownButton();
                videoConfig.video1.currentIndex++;
            }
        });
    }
    function handleSecondVideo() {
        if (!elements.scrollVideo2) return;
        elements.scrollVideo2.play();
        elements.scrollVideo2.addEventListener("timeupdate", () => {
            const currentPoint = videoConfig.video2.pausePoints[videoConfig.video2.currentIndex];
            if (currentPoint && 
                elements.scrollVideo2.currentTime >= currentPoint.time && 
                !videoConfig.video2.isPaused) {
                elements.scrollVideo2.pause();
                videoConfig.video2.isPaused = true;
                showText(currentPoint.textId);
                showScrollDownButton(); 
                videoConfig.video2.currentIndex++;
            }
        });
    }
    function showText(textId) {
        const textElement = document.getElementById(textId);
        const progressBar = document.getElementById(`timeline-${textId.split("-")[1]}`);

        if (textElement) {
            textElement.style.display = "block";
            gsap.to(textElement, { opacity: 1, duration: 0.5 });
        }

        if (progressBar) {
            gsap.to(progressBar, { width: "100%", duration: 1 });
        }
    }
    function hideCurrentText() {
        if (videoConfig.video2.currentIndex > 0) {
            const { textId } = videoConfig.video2.pausePoints[videoConfig.video2.currentIndex - 1];
            const textElement = document.getElementById(textId);
            const progressBar = document.getElementById(`timeline-${textId.split("-")[1]}`);
            if (textElement) {
                gsap.to(textElement, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        textElement.style.display = "none";
                    }
                });
            }
            if (progressBar) {
                gsap.to(progressBar, { width: "0%", duration: 0.3 });
            }
        }
    }
    function handleScroll() {
        if (state.footerVisible) {
            window.scrollTo(0, document.body.scrollHeight);
            return;
        }
        if (state.scrollTimeout) {
            clearTimeout(state.scrollTimeout);
        }
        const currentScroll = window.pageYOffset;
        const scrollDelta = currentScroll - state.lastScrollPosition;
        const currentTime = Date.now();
        const timeDelta = currentTime - state.lastScrollTime;
        state.scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        if (timeDelta > 50) {
            if (Math.abs(scrollDelta) > 20) {
                if (state.scrollDirection === 'down') {
                    if (videoConfig.video1.isPaused) {
                        videoConfig.video1.isPaused = false;
                        elements.scrollVideo1?.play();
                        hideScrollDownButton();
                    }
                    if (videoConfig.video2.isPaused) {
                        videoConfig.video2.isPaused = false;
                        elements.scrollVideo2?.play();
                        hideScrollDownButton(); 
                        hideCurrentText();
                    }
                }
            }
            state.lastScrollTime = currentTime;
            state.lastScrollPosition = currentScroll;
        }
        updateScrollProgress();
        state.scrollTimeout = setTimeout(() => {
            checkVideoPausePoints();
        }, 150);
    }

    function updateScrollProgress() {
        if (!elements.pageBar) return;
        if (!state.preloaderComplete) {
            elements.pageBar.style.height = '0%';
            return;
        }
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const scrollPercentage = (scrolled / documentHeight) * 100;
        elements.pageBar.style.height = `${scrollPercentage}%`;
    }
    function checkVideoPausePoints() {
        if (elements.scrollVideo1 && !videoConfig.video1.isPaused) {
            const currentPoint = videoConfig.video1.pausePoints[videoConfig.video1.currentIndex];
            if (currentPoint && elements.scrollVideo1.currentTime >= currentPoint) {
                elements.scrollVideo1.pause();
                videoConfig.video1.isPaused = true;
                videoConfig.video1.currentIndex++;
                showScrollDownButton();
            }
        }
        if (elements.scrollVideo2 && !videoConfig.video2.isPaused) {
            const currentPoint = videoConfig.video2.pausePoints[videoConfig.video2.currentIndex];
            if (currentPoint && elements.scrollVideo2.currentTime >= currentPoint.time) {
                elements.scrollVideo2.pause();
                videoConfig.video2.isPaused = true;
                showText(currentPoint.textId);
                showScrollDownButton(); 
                videoConfig.video2.currentIndex++;
            }
        }
    }
    function showFooter() {
        if (!elements.footer) return;
        
        elements.footer.style.display = "block";
        document.body.style.overflow = "hidden";
        state.footerVisible = true;
        gsap.fromTo(elements.footer, {
            opacity: 0,
            y: 50  
        }, {
            opacity: 1,
            y: 0,
            duration: 1, 
            ease: "power2.out"  
        });
    }
    function hideFooter() {
        if (!elements.footer) return;
        
        elements.footer.style.display = "none";
        document.body.style.overflow = "";
        state.footerVisible = false;
    }
    function handleBackToTop() {
        hideFooter();
        elements.secondVideoContainer.style.display = 'none';
        elements.firstVideoContainer.style.display = 'block';
        resetVideoState();
        smoothScrollTo(null);
        
        setTimeout(() => {
            if (elements.scrollVideo1) {
                elements.scrollVideo1.play();
                handleFirstVideo();
            }
        }, 100);
    }
    function initializePreloader() {
        disableScroll();
        animateBlobs();
        animatePreloaderText();
    }
    function initializeVideoTransitions() {
        if (elements.scrollVideo1) {
            elements.scrollVideo1.addEventListener("ended", () => {
                elements.firstVideoContainer.style.display = "none";
                elements.secondVideoContainer.style.display = "block";
                handleSecondVideo();
            });
        }
        if (elements.scrollVideo2) {
            elements.scrollVideo2.addEventListener("ended", () => {
                elements.secondVideoContainer.style.display = "none";
                showFooter();
            });
        }
    }
    function initialize() {
        window.scrollTo(0, 0);
        if (elements.pageBar) {
            elements.pageBar.style.height = '0%';
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener('scroll', updateScrollProgress);
        elements.backToTopButton?.addEventListener("click", handleBackToTop);
        initializePreloader();
        initializeVideoTransitions();
    }
    initialize();
});

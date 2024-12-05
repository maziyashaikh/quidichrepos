 document.addEventListener("DOMContentLoaded", () => {
        const shimmerWave = document.getElementById("shimmerWave");
        const preloaderVideo = document.getElementById("preloaderVideo");
        const preloader = document.getElementById("preloader");
        const progressBarPreloader = document.getElementById("progressBar");
        const leftBlob = document.querySelector(".blob.left");
        const rightBlob = document.querySelector(".blob.right");
        const firstVideoContainer = document.getElementById("firstVideoContainer");
        const scrollVideo1 = document.getElementById("scrollVideo1");
        const scrollDownButton = document.getElementById("scrollDownButton"); 
        const secondVideoContainer = document.getElementById("secondVideoContainer");
        const scrollVideo2 = document.getElementById("scrollVideo2");
    const scrollUpButton = document.getElementById("scrollUpButton");
        const pausePoints1 = [1.4, 3.6, 9.5, 11, 13, 18, 23.2];
        let currentPauseIndex1 = 0;
        let isPaused1 = false;
        const pausePoints2 = [
            { time: 19, textId: "text-1" },
            { time: 28, textId: "text-2" },
            { time: 39, textId: "text-3" },
            { time: 43, textId: "text-4" },
            { time: 59, textId: "text-5" },
            { time: 66, textId: "text-6" },
        ];
        let currentPauseIndex2 = 0;
        let isPaused2 = false;
        gsap.registerPlugin(ScrollTrigger);
        function disableScroll() {
            document.body.style.overflow = "hidden";
            console.log("Scroll disabled.");
        }
        function enableScroll() {
            document.body.style.overflow = "";
            console.log("Scroll enabled.");
        }
        function splitTextToSpans(element) {
            if (!element) return;
            const text = element.textContent.trim();
            element.innerHTML = "";
            const spans = text.split("").map((char) => {
                const span = document.createElement("span");
                span.textContent = char === " " ? "\u00A0" : char;
                return span;
            });
            spans.forEach((span) => element.appendChild(span));
        }
        function animateBlobs() {
            if (leftBlob && rightBlob) {
                gsap.timeline({ repeat: -1, yoyo: true })
                    .to(leftBlob, { y: "-50vh", duration: 6, ease: "power1.inOut" })
                    .to(leftBlob, { y: "50vh", duration: 6, ease: "power1.inOut" });

                gsap.timeline({ repeat: -1, yoyo: true })
                    .to(rightBlob, { y: "50vh", duration: 6, ease: "power1.inOut" })
                    .to(rightBlob, { y: "-50vh", duration: 6, ease: "power1.inOut" });

                console.log("Blob animations started.");
            }
        }
        function animateText() {
            if (shimmerWave) {
                splitTextToSpans(shimmerWave);
                const timeline = gsap.timeline();
                timeline
                    .to("#shimmerWave span", {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.05,
                    })
                    .to("#shimmerWave", {
                        scale: 0.5,
                        y: -window.innerHeight,
                        duration: 1,
                        ease: "power3.in",
                        onComplete: () => {
                            gsap.to(preloaderVideo, {
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                opacity: 1,
                                duration: 1,
                                ease: "power3.out",
                                onStart: () => {
                                    preloaderVideo.classList.remove("hidden");
                                    preloaderVideo.play();
                                    console.log("Preloader video started.");
                                },
                                onComplete: () => startProgressBarPreloader(),
                            });
                        },
                    });
                console.log("Text animation started.");
            }
        }
        function startProgressBarPreloader() {
            if (preloaderVideo && progressBarPreloader) {
                preloaderVideo.addEventListener("timeupdate", () => {
                    const progress = (preloaderVideo.currentTime / preloaderVideo.duration) * 100;
                    progressBarPreloader.style.width = `${progress}%`;
                    console.log(`Preloader progress: ${progress.toFixed(2)}%`);
                });
                preloaderVideo.addEventListener("ended", () => {
                    gsap.to(preloader, {
                        opacity: 0,
                        duration: 1,
                        onComplete: () => {
                            preloader.style.display = "none";
                            enableScroll();
                            handleFirstVideo();
                            console.log("Preloader ended.");
                        },
                    });
                });
                console.log("Preloader progress bar initialized.");
            }
        }
        function showScrollDownButton() {
            if (scrollDownButton) {
                scrollDownButton.classList.add("visible");
                console.log("Scroll-down button shown.");
            } else {
                console.warn("scrollDownButton element not found.");
            }
        }
        function hideScrollDownButton() {
            if (scrollDownButton) {
                scrollDownButton.classList.remove("visible");
                console.log("Scroll-down button hidden.");
            } else {
                console.warn("scrollDownButton element not found.");
            }
        }
        function handleFirstVideo() {
            scrollVideo1.play();
            scrollVideo1.addEventListener("timeupdate", () => {
                if (
                    currentPauseIndex1 < pausePoints1.length &&
                    scrollVideo1.currentTime >= pausePoints1[currentPauseIndex1] &&
                    !isPaused1
                ) {
                    scrollVideo1.pause();
                    isPaused1 = true;
                    showScrollDownButton();
                    console.log(`First Video Paused at ${pausePoints1[currentPauseIndex1]} seconds`);
                    currentPauseIndex1++;
                }
            });
            window.addEventListener("scroll", () => {
                if (isPaused1) {
                    isPaused1 = false;
                    scrollVideo1.play();
                    hideScrollDownButton();
                }
            }, { passive: true });
        }
    function handleSecondVideoWithPauses() {
        scrollVideo2.play();
        scrollVideo2.addEventListener("timeupdate", () => {
            if (
                currentPauseIndex2 < pausePoints2.length &&
                scrollVideo2.currentTime >= pausePoints2[currentPauseIndex2].time &&
                !isPaused2
            ) {
                scrollVideo2.pause();
                isPaused2 = true;
                const { textId } = pausePoints2[currentPauseIndex2];
                const textElement = document.getElementById(textId);
                const progressBar = document.getElementById(`timeline-${textId.split("-")[1]}`);
                if (textElement) {
                    textElement.style.display = "block";
                    gsap.to(textElement, { opacity: 1, duration: 0.5 });
                }
                if (progressBar) {
                    gsap.to(progressBar, { width: "100%", duration: 1 });
                }
                currentPauseIndex2++;
            }
        });

        window.addEventListener("scroll", () => {
            if (isPaused2 && currentPauseIndex2 > 0) {
                const { textId } = pausePoints2[currentPauseIndex2 - 1];
                const textElement = document.getElementById(textId);
                const progressBar = document.getElementById(`timeline-${textId.split("-")[1]}`);
                if (textElement) {
                    gsap.to(textElement, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            textElement.style.display = "none";
                        },
                    });
                }
                if (progressBar) {
                    gsap.to(progressBar, { width: "0%", duration: 0.5 });
                }
                isPaused2 = false;
                scrollVideo2.play();
            }
        }, { passive: true });
    }
        function handleFirstToSecondVideoTransition() {
            scrollVideo1.addEventListener("ended", () => {
                firstVideoContainer.style.display = "none";
                secondVideoContainer.style.display = "block";
                handleSecondVideoWithPauses();
            });
        }
        function initializePreloader() {
            disableScroll();
            animateBlobs();
            animateText();
        }
        function initializeAll() {
            initializePreloader();
        }
        initializeAll();
        handleFirstToSecondVideoTransition();
    });

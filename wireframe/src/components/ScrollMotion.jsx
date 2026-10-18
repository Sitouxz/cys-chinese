import { useEffect } from "react";

const blocks = [
  ".page-title-copy",
  ".section-head",
  ".values-grid > article",
  ".audience-grid > article",
  ".stories-grid > article",
  ".benefits > article",
  ".tier-grid > article",
  ".pricing-grid > article",
  ".members-grid > article",
  ".category-grid > a",
  ".industry-grid > a",
  ".service-path",
  ".faq",
  ".post-row",
  ".request-row",
  ".review-row",
  ".activity-row",
  ".use-detail > div",
  ".section h1",
  ".section h2",
  ".section h3",
  ".section > .shell > p",
  ".section.shell > p",
  ".article-body > p",
  ".auth-layout > aside > p",
  ".empty",
].join(", ");
const excluded =
  "form, nav, [role='tablist'], [role='dialog'], .field, .notice, .reveal-copy";
const clamp = (value) => Math.max(0, Math.min(1, value));

export function ScrollMotion() {
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const records = new Map();
    const active = new Set();
    let frame = 0;

    const update = () => {
      frame = 0;
      const changes = [];
      active.forEach((element) => {
        const record = records.get(element);
        const focused = !!element.closest("[data-scroll-block]:focus-within");
        if (record.media) {
          const bounds = element.parentElement.getBoundingClientRect();
          const progress = clamp(
            (innerHeight - bounds.top) / (innerHeight + bounds.height),
          );
          const drift =
            media.matches || focused
              ? 0
              : (0.5 - progress) * Math.min(16, bounds.height * 0.07);
          changes.push({ element, record, drift });
          return;
        }
        const bounds = element.getBoundingClientRect();
        // Subtract our own translation so repeated frames cannot feed it back.
        const top = bounds.top - (focused ? 0 : record.offset);
        const progress = clamp(
          (innerHeight * 0.94 - top - record.stagger) /
            Math.max(1, innerHeight * 0.27),
        );
        const offset = media.matches || focused ? 0 : (1 - progress) * 26;
        const opacity = media.matches || focused ? 1 : 0.86 + progress * 0.14;
        changes.push({ element, record, offset, opacity });
      });
      changes.forEach(({ element, record, offset, opacity, drift }) => {
        if (record.media) {
          element.style.setProperty("--scroll-drift", `${drift.toFixed(2)}px`);
          return;
        }
        element.style.setProperty("--scroll-offset", `${offset.toFixed(2)}px`);
        element.style.setProperty("--scroll-opacity", opacity.toFixed(3));
        record.offset = offset;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const intersection = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) active.add(target);
          else active.delete(target);
        });
        schedule();
      },
      { rootMargin: "120px 0px" },
    );
    const register = () => {
      records.forEach((_, element) => {
        if (element.isConnected) return;
        intersection.unobserve(element);
        records.delete(element);
        active.delete(element);
      });
      main.querySelectorAll(blocks).forEach((element) => {
        const button = element.closest("button");
        if (
          records.has(element) ||
          element.closest(excluded) ||
          element.parentElement.closest("[data-scroll-block]") ||
          element.querySelector("form, input, select, textarea") ||
          (button && !element.matches(".review-row"))
        )
          return;
        element.dataset.scrollBlock = "";
        const index = [...element.parentElement.children].indexOf(element);
        records.set(element, { offset: 0, stagger: (index % 3) * 16 });
        intersection.observe(element);
      });
      main.querySelectorAll(".story-art > img").forEach((element) => {
        if (records.has(element)) return;
        element.dataset.scrollMedia = "";
        records.set(element, { media: true });
        intersection.observe(element);
      });
      schedule();
    };
    // Tabs, filters and local actions can insert content without changing route.
    const mutations = new MutationObserver(register);
    mutations.observe(main, { childList: true, subtree: true });
    const size = new ResizeObserver(schedule);
    size.observe(main);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    main.addEventListener("focusin", schedule);
    main.addEventListener("focusout", schedule);
    media.addEventListener("change", schedule);
    register();

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      mutations.disconnect();
      size.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      main.removeEventListener("focusin", schedule);
      main.removeEventListener("focusout", schedule);
      media.removeEventListener("change", schedule);
      records.forEach((_, element) => {
        delete element.dataset.scrollBlock;
        delete element.dataset.scrollMedia;
        element.style.removeProperty("--scroll-offset");
        element.style.removeProperty("--scroll-opacity");
        element.style.removeProperty("--scroll-drift");
      });
    };
  }, []);
  return null;
}

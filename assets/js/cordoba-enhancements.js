/**
 * Córdoba Juegos — filtros de catálogo y promos (toast + modal bajo demanda)
 */
(function () {
  "use strict";

  var STORAGE_TOAST_CLOSED = "cj_promo_toast_closed";

  function initCatalogFilters() {
    var grid = document.getElementById("catalogGrid");
    if (!grid) return;
    var items = grid.querySelectorAll(".catalog-item");
    var buttons = document.querySelectorAll(".catalog-filter-btn");
    if (!items.length || !buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter") || "all";
        buttons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        items.forEach(function (item) {
          var cat = item.getAttribute("data-category");
          if (f === "all" || cat === f) {
            item.classList.remove("d-none");
          } else {
            item.classList.add("d-none");
          }
        });

        if (typeof AOS !== "undefined") {
          AOS.refresh();
        }
      });
    });
  }

  function initPromo() {
    var toast = document.getElementById("promoToast");
    var overlay = document.getElementById("promoPopup");
    var fab = document.getElementById("promoBtn");
    var closeBtn = document.getElementById("promoPopupClose");
    var pricingBtn = document.getElementById("promoModalPricingBtn");
    var stripBtn = document.getElementById("openPromoFromStrip");
    var toastDismiss = document.getElementById("promoToastDismiss");
    var toastDetail = document.getElementById("promoToastDetailBtn");

    if (!overlay) return;

    function openModal() {
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
      if (fab) fab.style.display = "none";
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (fab) {
        fab.style.display =
          sessionStorage.getItem(STORAGE_TOAST_CLOSED) === "1" ? "block" : "none";
      }
    }

    function dismissToast() {
      if (!toast) return;
      sessionStorage.setItem(STORAGE_TOAST_CLOSED, "1");
      toast.classList.remove("is-visible");
      toast.setAttribute("hidden", "");
      if (fab) fab.style.display = "block";
    }

    function showToastOnce() {
      if (!toast) return;
      if (sessionStorage.getItem(STORAGE_TOAST_CLOSED) === "1") {
        if (fab) fab.style.display = "block";
        return;
      }
      toast.removeAttribute("hidden");
      toast.classList.add("is-visible");
    }

    var invokerDone = false;
    function tryInvite() {
      if (invokerDone) return;
      if (sessionStorage.getItem(STORAGE_TOAST_CLOSED) === "1") return;
      invokerDone = true;
      showToastOnce();
    }

    if (sessionStorage.getItem(STORAGE_TOAST_CLOSED) === "1") {
      if (fab) fab.style.display = "block";
    } else {
      window.setTimeout(tryInvite, 32000);
      window.addEventListener(
        "scroll",
        function onScroll() {
          var doc = document.documentElement;
          var max = doc.scrollHeight - window.innerHeight;
          if (max <= 0) {
            tryInvite();
            window.removeEventListener("scroll", onScroll);
            return;
          }
          var ratio = window.scrollY / max;
          if (ratio >= 0.42) {
            tryInvite();
            window.removeEventListener("scroll", onScroll);
          }
        },
        { passive: true }
      );
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    if (pricingBtn) {
      pricingBtn.addEventListener("click", function () {
        closeModal();
        var sec = document.getElementById("pricing");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (stripBtn) stripBtn.addEventListener("click", openModal);
    if (toastDetail) toastDetail.addEventListener("click", openModal);
    if (toastDismiss) toastDismiss.addEventListener("click", dismissToast);

    if (fab) fab.addEventListener("click", openModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.style.display === "flex") {
        closeModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initCatalogFilters();
      initPromo();
    });
  } else {
    initCatalogFilters();
    initPromo();
  }
})();

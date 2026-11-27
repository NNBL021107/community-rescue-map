/**
 * ============================================================
 *  Community Rescue Map – Map Controller  (js/map.js)
 * ============================================================
 *  Dùng cho: index.html
 *  Phụ thuộc: js/data.js (getRequests, getTypeLabel, getStatusLabel,
 *             getTypeClass)
 *
 *  Chức năng:
 *   1. Render Marker trên bản đồ từ dữ liệu getRequests()
 *   2. Lọc Marker theo trạng thái (tất cả / đang chờ / đã giúp)
 *   3. Hiện Popup chi tiết khi bấm Marker
 *   4. Render bảng thống kê nhanh
 * ============================================================
 */

(function () {
  "use strict";

  /* ==========  DOM References  ================================ */

  const mapEl         = document.getElementById("map");
  const statsEl       = document.getElementById("stats");
  const popupOverlay  = document.getElementById("popupOverlay");
  const popupBody     = document.getElementById("popupBody");
  const popupTitle    = document.getElementById("popupTitle");
  const popupClose    = document.getElementById("popupClose");
  const filterBtns    = document.querySelectorAll(".filter-btn");
  const navToggle     = document.querySelector(".navbar__toggle");
  const navLinks      = document.querySelector(".navbar__links");

  /* ==========  State  ========================================= */

  let allRequests   = [];
  let activeFilter  = "all";   // "all" | "dang-cho" | "da-giup"

  /* ==========  1. Khởi tạo  =================================== */

  function init() {
    allRequests = getRequests();

    renderMarkers(allRequests);
    renderStats(allRequests);
    bindFilterButtons();
    bindPopupClose();
    bindNavToggle();
  }

  /* ==========  2. Render Markers  ============================== */

  /**
   * Vẽ toàn bộ Marker lên bản đồ.
   * Dùng .map() để tạo HTML rồi gán innerHTML một lần (hiệu suất tốt).
   * @param {Array} requests – Danh sách yêu cầu cần hiển thị.
   */
  function renderMarkers(requests) {
    mapEl.innerHTML = requests
      .map(function (req) {
        // Xác định class màu
        var colorClass =
          req.status === "da-giup"
            ? "marker--done"
            : "marker--" + getTypeClass(req.type);

        return (
          '<button class="marker ' +
          colorClass +
          '"' +
          ' style="top:' +
          req.coords.top +
          "%; left:" +
          req.coords.left +
          '%"' +
          ' data-id="' +
          req.id +
          '"' +
          ' aria-label="' +
          req.name +
          " – " +
          getTypeLabel(req.type) +
          '"' +
          ' title="' +
          req.name +
          '"' +
          "></button>"
        );
      })
      .join("");

    // Gắn sự kiện click cho từng Marker
    mapEl.querySelectorAll(".marker").forEach(function (marker) {
      marker.addEventListener("click", function () {
        var id  = this.getAttribute("data-id");
        var req = allRequests.find(function (r) { return r.id === id; });
        if (req) openPopup(req);
      });
    });
  }

  /* ==========  3. Bộ lọc trạng thái  ========================== */

  function bindFilterButtons() {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Cập nhật trạng thái active
        filterBtns.forEach(function (b) { b.classList.remove("filter-btn--active"); });
        this.classList.add("filter-btn--active");

        activeFilter = this.getAttribute("data-filter");

        // Dùng .filter() để lọc danh sách
        var filtered =
          activeFilter === "all"
            ? allRequests
            : allRequests.filter(function (req) {
                return req.status === activeFilter;
              });

        renderMarkers(filtered);
        renderStats(allRequests, activeFilter);
      });
    });
  }

  /* ==========  4. Popup chi tiết  ============================== */

  /**
   * Mở Popup và điền nội dung chi tiết của 1 yêu cầu.
   * @param {Object} req – Object yêu cầu cứu trợ.
   */
  function openPopup(req) {
    var typeClass   = getTypeClass(req.type);
    var statusClass = req.status === "da-giup" ? "done" : "pending";

    popupTitle.textContent = req.name;

    popupBody.innerHTML =
      '<div class="popup__row">' +
        '<span class="popup__label">📞 SĐT:</span>' +
        '<span class="popup__value"><a href="tel:' +
        req.phone.replace(/\s/g, "") +
        '">' +
        req.phone +
        "</a></span>" +
      "</div>" +
      '<div class="popup__row">' +
        '<span class="popup__label">📍 Địa chỉ:</span>' +
        '<span class="popup__value">' +
        req.address +
        "</span>" +
      "</div>" +
      '<div class="popup__row">' +
        '<span class="popup__label">📋 Nhu cầu:</span>' +
        '<span class="popup__value"><span class="badge badge--' +
        typeClass +
        '">' +
        getTypeLabel(req.type) +
        "</span></span>" +
      "</div>" +
      '<div class="popup__row">' +
        '<span class="popup__label">⏳ Trạng thái:</span>' +
        '<span class="popup__value"><span class="badge badge--' +
        statusClass +
        '">' +
        getStatusLabel(req.status) +
        "</span></span>" +
      "</div>" +
      '<div class="popup__row">' +
        '<span class="popup__label">📝 Ghi chú:</span>' +
        '<span class="popup__value">' +
        req.note +
        "</span>" +
      "</div>";

    popupOverlay.classList.add("popup-overlay--visible");
    popupClose.focus();
  }

  /** Đóng Popup */
  function closePopup() {
    popupOverlay.classList.remove("popup-overlay--visible");
  }

  function bindPopupClose() {
    // Nút đóng
    popupClose.addEventListener("click", closePopup);

    // Click overlay ngoài card
    popupOverlay.addEventListener("click", function (e) {
      if (e.target === popupOverlay) closePopup();
    });

    // Phím Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopup();
    });
  }

  /* ==========  5. Thống kê nhanh  ============================== */

  /**
   * Render 3 thẻ thống kê: Tổng / Đang chờ / Đã giúp.
   * @param {Array}  requests – Toàn bộ danh sách.
   * @param {string} [highlight] – filter đang active (để highlight).
   */
  function renderStats(requests, highlight) {
    var total   = requests.length;
    var pending = requests.filter(function (r) { return r.status === "dang-cho"; }).length;
    var done    = requests.filter(function (r) { return r.status === "da-giup"; }).length;

    statsEl.innerHTML =
      '<div class="stat-card stat-card--total">' +
        '<div class="stat-card__number">' + total   + "</div>" +
        '<div class="stat-card__label">Tổng yêu cầu</div>' +
      "</div>" +
      '<div class="stat-card stat-card--pending">' +
        '<div class="stat-card__number">' + pending + "</div>" +
        '<div class="stat-card__label">Đang chờ hỗ trợ</div>' +
      "</div>" +
      '<div class="stat-card stat-card--done">' +
        '<div class="stat-card__number">' + done    + "</div>" +
        '<div class="stat-card__label">Đã được giúp</div>' +
      "</div>";
  }

  /* ==========  6. Navbar toggle (mobile)  ====================== */

  function bindNavToggle() {
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("navbar__links--open");
      navToggle.setAttribute("aria-expanded", isOpen);
    });
  }

  /* ==========  GO!  ============================================ */

  document.addEventListener("DOMContentLoaded", init);
})();
/**
 * ============================================================
 *  Community Rescue Map – Requests Controller  (js/requests.js)
 * ============================================================
 *  Dùng cho: requests.html
 *  Phụ thuộc: js/data.js (getRequests, saveRequests, getTypeLabel,
 *             getStatusLabel, getTypeClass)
 * ============================================================
 */

(function () {
  "use strict";

  /* ========== DOM References ========== */
  const cardGrid    = document.getElementById("cardGrid");
  const form        = document.getElementById("requestForm");
  const toast       = document.getElementById("toast");
  const toastMsg    = document.getElementById("toastMsg");
  const filterBtns  = document.querySelectorAll(".filter-btn");
  const navToggle   = document.querySelector(".navbar__toggle");
  const navLinks    = document.querySelector(".navbar__links");

  const fields = {
    name:    { input: document.getElementById("inputName"),    error: document.getElementById("errorName") },
    phone:   { input: document.getElementById("inputPhone"),   error: document.getElementById("errorPhone") },
    address: { input: document.getElementById("inputAddress"), error: document.getElementById("errorAddress") },
    type:    { input: document.getElementById("inputType"),    error: document.getElementById("errorType") },
    note:    { input: document.getElementById("inputNote"),    error: document.getElementById("errorNote") }
  };

  /* ========== State ========== */
  let allRequests  = [];
  let activeFilter = "all";

  /* Regex kiểm tra SĐT Việt Nam: bắt đầu bằng số 0, đúng 10 chữ số */
  const PHONE_REGEX = /^0\d{9}$/;

  /* ========== 1. Khởi tạo ========== */
  function init() {
    allRequests = getRequests();
    renderCards(allRequests);
    bindFilterButtons();
    bindFormSubmit();
    bindRealTimeValidation();
    bindNavToggle();
  }

  /* ========== 2. Render Cards bằng .map() ========== */
  function renderCards(requests) {
    if (requests.length === 0) {
      cardGrid.innerHTML = `
        <div class="card-grid__empty">
          <p>Không có yêu cầu nào thuộc trạng thái này.</p>
        </div>
      `;
      return;
    }

    cardGrid.innerHTML = requests
      .map(function (req) {
        const typeClass   = getTypeClass(req.type);
        const accentClass = req.status === "da-giup" ? "done" : typeClass;
        const statusClass = req.status === "da-giup" ? "done" : "pending";

        return `
          <article class="req-card">
            <div class="req-card__accent req-card__accent--${accentClass}"></div>
            <div class="req-card__body">
              <div class="req-card__header">
                <span class="req-card__name">${escapeHtml(req.name)}</span>
                <span class="req-card__id">${req.id}</span>
              </div>
              
              <div class="req-card__row req-card__phone">
                <span class="req-card__icon">📞</span>
                <a href="tel:${req.phone.replace(/\s/g, "")}">${req.phone}</a>
              </div>

              <div class="req-card__row">
                <span class="req-card__icon">📍</span>
                <span>${escapeHtml(req.address)}</span>
              </div>

              <div class="req-card__note">
                📝 ${escapeHtml(req.note)}
              </div>

              <div class="req-card__tags">
                <span class="badge badge--${typeClass}">${getTypeLabel(req.type)}</span>
                <span class="badge badge--${statusClass}">${getStatusLabel(req.status)}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  /* ========== 3. Bộ lọc trạng thái bằng .filter() ========== */
  function bindFilterButtons() {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("filter-btn--active"); });
        this.classList.add("filter-btn--active");

        activeFilter = this.getAttribute("data-filter");

        const filtered =
          activeFilter === "all"
            ? allRequests
            : allRequests.filter(function (req) {
                return req.status === activeFilter;
              });

        renderCards(filtered);
      });
    });
  }

  /* ========== 4. Xử lý Form & Validation (event.preventDefault()) ========== */
  function bindFormSubmit() {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      clearAllErrors();
      let isValid = true;

      // 1. Kiểm tra Họ tên
      const nameVal = fields.name.input.value.trim();
      if (!nameVal) {
        showError("name", "Vui lòng nhập họ và tên.");
        isValid = false;
      }

      // 2. Kiểm tra Số điện thoại (Regex: 10 chữ số, bắt đầu bằng 0)
      const phoneVal = fields.phone.input.value.trim().replace(/\s/g, "");
      if (!phoneVal) {
        showError("phone", "Vui lòng nhập số điện thoại.");
        isValid = false;
      } else if (!PHONE_REGEX.test(phoneVal)) {
        showError("phone", "SĐT phải đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0901234567).");
        isValid = false;
      }

      // 3. Kiểm tra Địa chỉ
      const addressVal = fields.address.input.value.trim();
      if (!addressVal) {
        showError("address", "Vui lòng nhập địa chỉ cụ thể.");
        isValid = false;
      }

      // 4. Kiểm tra Loại nhu cầu
      const typeVal = fields.type.input.value;
      if (!typeVal) {
        showError("type", "Vui lòng chọn loại nhu cầu.");
        isValid = false;
      }

      // 5. Kiểm tra Ghi chú
      const noteVal = fields.note.input.value.trim();
      if (!noteVal) {
        showError("note", "Vui lòng nhập ghi chú chi tiết.");
        isValid = false;
      }

      // Dừng nếu form không hợp lệ
      if (!isValid) {
        const firstError = form.querySelector(".form-group__input--error, .form-group__select--error, .form-group__textarea--error");
        if (firstError) firstError.focus();
        return;
      }

      // Hợp lệ: Tạo yêu cầu mới với tọa độ ngẫu nhiên từ 20% đến 80%
      const newReq = {
        id: generateId(),
        name: nameVal,
        phone: formatPhone(phoneVal),
        address: addressVal,
        type: typeVal,
        status: "dang-cho",
        note: noteVal,
        coords: {
          top: randomCoord(20, 80),
          left: randomCoord(20, 80)
        }
      };

      // Đưa vào đầu danh sách & đồng bộ localStorage
      allRequests.unshift(newReq);
      saveRequests(allRequests);

      // Cập nhật giao diện về bộ lọc "Tất cả" & render lại ngay lập tức
      activeFilter = "all";
      filterBtns.forEach(function (b) {
        b.classList.toggle("filter-btn--active", b.getAttribute("data-filter") === "all");
      });
      renderCards(allRequests);

      // Reset form & thông báo
      form.reset();
      showToast(`Đã gửi thành công yêu cầu ${newReq.id}!`);

      // Cuộn lên xem card mới
      cardGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* Tự động xóa lỗi khi người dùng bắt đầu sửa */
  function bindRealTimeValidation() {
    Object.keys(fields).forEach(function (key) {
      const el = fields[key].input;
      const eventType = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventType, function () {
        clearError(key);
      });
    });
  }

  /* ========== 5. Validation Helpers (Hiện lỗi đỏ dưới input) ========== */
  function showError(fieldKey, message) {
    const f = fields[fieldKey];
    if (f.input.tagName === "SELECT") {
      f.input.classList.add("form-group__select--error");
    } else if (f.input.tagName === "TEXTAREA") {
      f.input.classList.add("form-group__textarea--error");
    } else {
      f.input.classList.add("form-group__input--error");
    }
    f.error.textContent = message;
    f.error.classList.add("form-group__error--visible");
  }

  function clearError(fieldKey) {
    const f = fields[fieldKey];
    f.input.classList.remove(
      "form-group__input--error",
      "form-group__select--error",
      "form-group__textarea--error"
    );
    f.error.textContent = "";
    f.error.classList.remove("form-group__error--visible");
  }

  function clearAllErrors() {
    Object.keys(fields).forEach(clearError);
  }

  /* ========== 6. Tiện ích bổ trợ ========== */
  function generateId() {
    let max = 0;
    allRequests.forEach(function (r) {
      const m = r.id.match(/REQ-(\d+)/);
      if (m) {
        const val = parseInt(m[1], 10);
        if (val > max) max = val;
      }
    });
    return "REQ-" + String(max + 1).padStart(3, "0");
  }

  function formatPhone(raw) {
    return raw.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  function randomCoord(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add("toast--visible");
    setTimeout(function () {
      toast.classList.remove("toast--visible");
    }, 4000);
  }

  /* Navbar mobile toggle */
  function bindNavToggle() {
    if (!navToggle || !navLinks) return;
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("navbar__links--open");
      navToggle.setAttribute("aria-expanded", isOpen);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
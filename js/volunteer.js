/**
 * ============================================================
 *  Community Rescue Map – Volunteer Controller (js/volunteer.js)
 * ============================================================
 *  Dùng cho: volunteer.html
 *  Chức năng:
 *   1. Validation Form tình nguyện viên (event.preventDefault):
 *      - Không được bỏ trống Họ tên, SĐT, Email, Khu vực
 *      - Regex SĐT (10 chữ số bắt đầu bằng 0)
 *      - Regex Email chuẩn
 *      - Bắt buộc chọn ít nhất 1 khả năng hỗ trợ
 *      - Hiển thị thông báo lỗi màu đỏ ngay dưới từng ô
 *   2. Lưu danh sách vào localStorage với key "volunteers"
 *   3. Hiển thị thông báo Toast thành công (tự ẩn sau 3 giây bằng setTimeout)
 *   4. Hiển thị danh sách tình nguyện viên vừa đăng ký ở bên dưới
 * ============================================================
 */

(function () {
  "use strict";

  /* ========== Storage Key & Default Data ========== */
  const VOLUNTEER_STORAGE_KEY = "volunteers";

  const DEFAULT_VOLUNTEERS = [
    {
      id: "VOL-001",
      name: "Đội Xe Bán Tải Phản Ứng Nhanh Biên Hòa",
      phone: "0908 123 456",
      email: "pickup.bienhoa@gmail.com",
      area: "TP. Biên Hòa",
      skills: ["van-chuyen", "nhu-yeu-pham"],
      createdAt: "26/11/2026 14:30"
    },
    {
      id: "VOL-002",
      name: "Bác sĩ Trần Thanh Tùng",
      phone: "0934 987 654",
      email: "tung.dr@gmail.com",
      area: "Huyện Nhơn Trạch",
      skills: ["y-te"],
      createdAt: "26/11/2026 16:15"
    },
    {
      id: "VOL-003",
      name: "Nhóm Hảo Tâm Suối Cam",
      phone: "0987 345 678",
      email: "suoicam.help@yahoo.com",
      area: "Huyện Thống Nhất",
      skills: ["nhu-yeu-pham", "cho-o"],
      createdAt: "27/11/2026 08:00"
    }
  ];

  /* Mapping nhãn kỹ năng */
  const SKILL_MAP = {
    "van-chuyen":    { label: "Vận chuyển",        class: "badge--shelter" },
    "y-te":          { label: "Hỗ trợ y tế",       class: "badge--medical" },
    "nhu-yeu-pham":  { label: "Nhu yếu phẩm",      class: "badge--food"    },
    "cho-o":         { label: "Chỗ ở tạm thời",    class: "badge--done"    }
  };

  /* ========== DOM References ========== */
  const form        = document.getElementById("volunteerForm");
  const volGrid     = document.getElementById("volGrid");
  const toast       = document.getElementById("toast");
  const toastMsg    = document.getElementById("toastMsg");
  const navToggle   = document.querySelector(".navbar__toggle");
  const navLinks    = document.querySelector(".navbar__links");

  const fields = {
    name:  { input: document.getElementById("inputName"),  error: document.getElementById("errorName")  },
    phone: { input: document.getElementById("inputPhone"), error: document.getElementById("errorPhone") },
    email: { input: document.getElementById("inputEmail"), error: document.getElementById("errorEmail") },
    area:  { input: document.getElementById("inputArea"),  error: document.getElementById("errorArea")  }
  };

  const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
  const errorSkills     = document.getElementById("errorSkills");
  const skillsContainer = document.getElementById("skillsContainer");

  /* ========== Regular Expressions ========== */
  // SĐT Việt Nam: đúng 10 chữ số, bắt đầu bằng số 0
  const PHONE_REGEX = /^0\d{9}$/;
  // Email RFC 5322 regex thông dụng
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let toastTimer = null;

  /* ========== 1. Khởi tạo ========== */
  function init() {
    renderVolunteers();
    bindFormSubmit();
    bindRealTimeValidation();
    bindNavToggle();
  }

  /* ========== 2. LocalStorage Helpers ========== */
  function getVolunteers() {
    const raw = localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn("[volunteer.js] Lỗi đọc volunteers localStorage:", e);
      }
    }
    // Khởi tạo mặc định nếu chưa có
    saveVolunteers(DEFAULT_VOLUNTEERS);
    return structuredClone(DEFAULT_VOLUNTEERS);
  }

  function saveVolunteers(volunteers) {
    try {
      localStorage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(volunteers));
    } catch (e) {
      console.error("[volunteer.js] Không thể ghi volunteers localStorage:", e);
    }
  }

  /* ========== 3. Render danh sách tình nguyện viên ========== */
  function renderVolunteers() {
    const list = getVolunteers();

    if (list.length === 0) {
      volGrid.innerHTML = `
        <div class="vol-grid__empty">
          <p>Chưa có tình nguyện viên nào. Hãy là người đầu tiên đăng ký!</p>
        </div>
      `;
      return;
    }

    volGrid.innerHTML = list
      .map(function (vol) {
        const skillsHtml = (vol.skills || [])
          .map(function (s) {
            const item = SKILL_MAP[s] || { label: s, class: "badge--shelter" };
            return `<span class="badge ${item.class}">${item.label}</span>`;
          })
          .join(" ");

        return `
          <article class="vol-card">
            <div class="vol-card__header">
              <span class="vol-card__name">${escapeHtml(vol.name)}</span>
              <span class="vol-card__date">${vol.createdAt || ""}</span>
            </div>

            <div class="vol-card__row">
              <span class="vol-card__icon">📞</span>
              <a href="tel:${vol.phone.replace(/\s/g, "")}">${vol.phone}</a>
            </div>

            <div class="vol-card__row">
              <span class="vol-card__icon">✉️</span>
              <a href="mailto:${vol.email}">${escapeHtml(vol.email)}</a>
            </div>

            <div class="vol-card__row">
              <span class="vol-card__icon">📍</span>
              <span><strong>Khu vực:</strong> ${escapeHtml(vol.area)}</span>
            </div>

            <div class="vol-card__skills">
              ${skillsHtml}
            </div>
          </article>
        `;
      })
      .join("");
  }

  /* ========== 4. Form Validation & Submit ========== */
  function bindFormSubmit() {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      clearAllErrors();
      let isValid = true;

      // 1. Kiểm tra Họ tên / Tổ chức
      const nameVal = fields.name.input.value.trim();
      if (!nameVal) {
        showError("name", "Vui lòng nhập Họ tên hoặc Tên tổ chức.");
        isValid = false;
      }

      // 2. Kiểm tra Số điện thoại
      const phoneRaw = fields.phone.input.value.trim().replace(/\s/g, "");
      if (!phoneRaw) {
        showError("phone", "Vui lòng nhập số điện thoại liên hệ.");
        isValid = false;
      } else if (!PHONE_REGEX.test(phoneRaw)) {
        showError("phone", "SĐT phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0912345678).");
        isValid = false;
      }

      // 3. Kiểm tra Email
      const emailVal = fields.email.input.value.trim();
      if (!emailVal) {
        showError("email", "Vui lòng nhập địa chỉ email.");
        isValid = false;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        showError("email", "Địa chỉ email không hợp lệ (VD: tinhnguyen@example.com).");
        isValid = false;
      }

      // 4. Kiểm tra Khu vực hỗ trợ
      const areaVal = fields.area.input.value;
      if (!areaVal) {
        showError("area", "Vui lòng chọn khu vực bạn có thể hỗ trợ.");
        isValid = false;
      }

      // 5. Kiểm tra nhóm Checkbox (chọn ít nhất 1)
      const selectedSkills = [];
      skillCheckboxes.forEach(function (cb) {
        if (cb.checked) {
          selectedSkills.push(cb.value);
        }
      });

      if (selectedSkills.length === 0) {
        showSkillsError("Vui lòng chọn ít nhất 1 khả năng bạn có thể hỗ trợ.");
        isValid = false;
      }

      // Nếu có lỗi: focus vào ô lỗi đầu tiên
      if (!isValid) {
        const firstError = form.querySelector(".form-group__input--error, .form-group__select--error, .skill-choice--error");
        if (firstError) firstError.focus();
        return;
      }

      // HỢP LỆ: Tạo tình nguyện viên mới
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newVol = {
        id: "VOL-" + Date.now().toString().slice(-4),
        name: nameVal,
        phone: formatPhone(phoneRaw),
        email: emailVal,
        area: areaVal,
        skills: selectedSkills,
        createdAt: timeStr
      };

      // Đưa vào đầu danh sách & lưu localStorage
      const currentList = getVolunteers();
      currentList.unshift(newVol);
      saveVolunteers(currentList);

      // Cập nhật lại giao diện danh sách ngay
      renderVolunteers();

      // Reset form
      form.reset();

      // Hiển thị thông báo thành công mượt mà (tự ẩn sau 3 giây)
      showToastSuccess(`Cảm ơn ${newVol.name}! Bạn đã đăng ký tình nguyện thành công.`);

      // Cuộn mượt xuống danh sách để xem thẻ vừa tạo
      volGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ========== 5. Validation Helpers ========== */
  function showError(key, msg) {
    const f = fields[key];
    if (f.input.tagName === "SELECT") {
      f.input.classList.add("form-group__select--error");
    } else {
      f.input.classList.add("form-group__input--error");
    }
    f.error.textContent = msg;
    f.error.classList.add("form-group__error--visible");
  }

  function clearError(key) {
    const f = fields[key];
    f.input.classList.remove("form-group__input--error", "form-group__select--error");
    f.error.textContent = "";
    f.error.classList.remove("form-group__error--visible");
  }

  function showSkillsError(msg) {
    errorSkills.textContent = msg;
    errorSkills.classList.add("form-group__error--visible");
    const choices = skillsContainer.querySelectorAll(".skill-choice");
    choices.forEach(function (c) {
      c.classList.add("skill-choice--error");
    });
  }

  function clearSkillsError() {
    errorSkills.textContent = "";
    errorSkills.classList.remove("form-group__error--visible");
    const choices = skillsContainer.querySelectorAll(".skill-choice");
    choices.forEach(function (c) {
      c.classList.remove("skill-choice--error");
    });
  }

  function clearAllErrors() {
    Object.keys(fields).forEach(clearError);
    clearSkillsError();
  }

  /* Tự động xóa lỗi khi người dùng gõ / tick */
  function bindRealTimeValidation() {
    Object.keys(fields).forEach(function (key) {
      const el = fields[key].input;
      const evt = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(evt, function () {
        clearError(key);
      });
    });

    skillCheckboxes.forEach(function (cb) {
      cb.addEventListener("change", function () {
        clearSkillsError();
      });
    });
  }

  /* ========== 6. Toast Success (Tự ẩn sau 3 giây bằng setTimeout) ========== */
  function showToastSuccess(msg) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastMsg.textContent = msg;
    toast.classList.add("toast--visible");

    toastTimer = setTimeout(function () {
      toast.classList.remove("toast--visible");
    }, 3000);
  }

  /* ========== 7. Tiện ích bổ trợ ========== */
  function formatPhone(raw) {
    return raw.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
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
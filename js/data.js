/**
 * ============================================================
 *  Community Rescue Map – Data Layer  (js/data.js)
 * ============================================================
 *  Dùng chung cho: index.html · requests.html · volunteer.html
 *  - Dữ liệu mẫu DEFAULT_REQUESTS (6 yêu cầu – khu vực Đồng Nai)
 *  - localStorage helpers: getRequests() / saveRequests()
 *  - Hàm chuyển mã type / status sang tiếng Việt
 * ============================================================
 */

/* ----------  1. Dữ liệu mẫu  -------------------------------- */

const DEFAULT_REQUESTS = [
  {
    id: "REQ-001",
    name: "Nguyễn Văn An",
    phone: "0901 234 567",
    address: "Ấp 3, xã Phú Hội, huyện Nhơn Trạch, Đồng Nai",
    type: "y-te",
    status: "dang-cho",
    note: "Cần thuốc hạ sốt và băng gạc y tế cho 4 người lớn tuổi.",
    coords: { top: 72, left: 58 }
  },
  {
    id: "REQ-002",
    name: "Trần Thị Bích Ngọc",
    phone: "0912 345 678",
    address: "Tổ 5, KP.2, phường Trảng Dài, TP. Biên Hòa, Đồng Nai",
    type: "thuc-pham",
    status: "dang-cho",
    note: "Gia đình 6 người cần gạo, mì tôm và nước uống đóng chai.",
    coords: { top: 35, left: 42 }
  },
  {
    id: "REQ-003",
    name: "Lê Hoàng Phúc",
    phone: "0938 456 789",
    address: "Ấp Suối Cả, xã Xuân Thiện, huyện Thống Nhất, Đồng Nai",
    type: "noi-o",
    status: "dang-cho",
    note: "Nhà bị ngập hoàn toàn, cần chỗ tạm trú cho 3 người (có trẻ nhỏ).",
    coords: { top: 48, left: 65 }
  },
  {
    id: "REQ-004",
    name: "Phạm Minh Tuấn",
    phone: "0976 567 890",
    address: "Ấp 1, xã Bắc Sơn, huyện Trảng Bom, Đồng Nai",
    type: "y-te",
    status: "da-giup",
    note: "Người già bị té ngã, đã được đưa đi trạm y tế xã.",
    coords: { top: 28, left: 55 }
  },
  {
    id: "REQ-005",
    name: "Võ Thị Hồng Nhung",
    phone: "0965 678 901",
    address: "Tổ 3, ấp Tân Lập, xã Hố Nai 3, huyện Trảng Bom, Đồng Nai",
    type: "thuc-pham",
    status: "da-giup",
    note: "Đã nhận 2 thùng mì, 10 kg gạo và nước suối từ đội tình nguyện.",
    coords: { top: 32, left: 50 }
  },
  {
    id: "REQ-006",
    name: "Đặng Quốc Việt",
    phone: "0944 789 012",
    address: "Ấp 6, xã Phú Ngọc, huyện Định Quán, Đồng Nai",
    type: "noi-o",
    status: "dang-cho",
    note: "Mái nhà bị tốc, cần bạt che mưa và vật liệu sửa tạm.",
    coords: { top: 15, left: 38 }
  }
];

/* ----------  2. localStorage helpers  ------------------------ */

const STORAGE_KEY = "communityRescueMap_requests";

/**
 * Lấy danh sách yêu cầu từ localStorage.
 * Nếu chưa có dữ liệu, tự động nạp DEFAULT_REQUESTS và lưu lại.
 * @returns {Array} Mảng các object yêu cầu cứu trợ.
 */
function getRequests() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[data.js] Dữ liệu localStorage lỗi, nạp lại mặc định.", e);
    }
  }

  // Lần đầu hoặc dữ liệu hỏng → khởi tạo từ DEFAULT_REQUESTS
  saveRequests(DEFAULT_REQUESTS);
  return structuredClone(DEFAULT_REQUESTS);
}

/**
 * Lưu danh sách yêu cầu vào localStorage (đồng bộ giữa các trang).
 * @param {Array} requests – Mảng yêu cầu cần lưu.
 */
function saveRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error("[data.js] Không thể ghi localStorage.", e);
  }
}

/* ----------  3. Chuyển mã sang tiếng Việt  ------------------- */

const TYPE_LABELS = {
  "y-te":      "Y tế",
  "thuc-pham": "Thực phẩm",
  "noi-o":     "Nơi ở"
};

const STATUS_LABELS = {
  "dang-cho": "Đang chờ",
  "da-giup":  "Đã giúp"
};

/**
 * Trả về nhãn tiếng Việt cho mã loại nhu cầu.
 * @param {string} typeCode – "y-te" | "thuc-pham" | "noi-o"
 * @returns {string}
 */
function getTypeLabel(typeCode) {
  return TYPE_LABELS[typeCode] || typeCode;
}

/**
 * Trả về nhãn tiếng Việt cho mã trạng thái.
 * @param {string} statusCode – "dang-cho" | "da-giup"
 * @returns {string}
 */
function getStatusLabel(statusCode) {
  return STATUS_LABELS[statusCode] || statusCode;
}

/**
 * Trả về tên biến CSS tương ứng với type (dùng để áp màu).
 * @param {string} typeCode
 * @returns {string} Tên class CSS: "medical" | "food" | "shelter"
 */
function getTypeClass(typeCode) {
  const map = {
    "y-te":      "medical",
    "thuc-pham": "food",
    "noi-o":     "shelter"
  };
  return map[typeCode] || "";
}
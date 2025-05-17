import { Solar } from "lunar-javascript";
import SeasonalFiveElements from "../models/seasonalFiveElements.js";
const tietKhiTable = [
  { name: "Tiểu Hàn", date: "01-05" },
  { name: "Đại Hàn", date: "01-20" },
  { name: "Lập Xuân", date: "02-04" },
  { name: "Vũ Thủy", date: "02-19" },
  { name: "Kinh Trập", date: "03-05" },
  { name: "Xuân Phân", date: "03-20" },
  { name: "Thanh Minh", date: "04-04" },
  { name: "Cốc Vũ", date: "04-20" },
  { name: "Lập Hạ", date: "05-05" },
  { name: "Tiểu Mãn", date: "05-21" },
  { name: "Mang Chủng", date: "06-05" },
  { name: "Hạ Chí", date: "06-21" },
  { name: "Tiểu Thử", date: "07-07" },
  { name: "Đại Thử", date: "07-23" },
  { name: "Lập Thu", date: "08-07" },
  { name: "Xử Thử", date: "08-23" },
  { name: "Bạch Lộ", date: "09-07" },
  { name: "Thu Phân", date: "09-23" },
  { name: "Hàn Lộ", date: "10-08" },
  { name: "Sương Giáng", date: "10-23" },
  { name: "Lập Đông", date: "11-07" },
  { name: "Tiểu Tuyết", date: "11-22" },
  { name: "Đại Tuyết", date: "12-07" },
  { name: "Đông Chí", date: "12-21" },
];
function getCanChiGio(date) {
  const can = [
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
  ];
  const chi = [
    "Tý",
    "Sửu",
    "Dần",
    "Mão",
    "Thìn",
    "Tỵ",
    "Ngọ",
    "Mùi",
    "Thân",
    "Dậu",
    "Tuất",
    "Hợi",
  ];

  const canIndexOfDay = getCanOfDay(date); // lấy chỉ số Can ngày (0-9)

  const hour = date.getUTCHours();

  // Tìm Chi giờ theo giờ
  const chiIndex = Math.floor((hour + 1) / 2) % 12;
  const chiGio = chi[chiIndex];

  // Tìm Can giờ dựa theo Can ngày
  const canIndex = (canIndexOfDay * 2 + chiIndex) % 10;
  const canGio = can[canIndex];

  return `${canGio} ${chiGio}`;
}

// Hàm tính Can ngày dựa theo công thức thuật toán (đơn giản, gần đúng)
function getCanOfDay(date) {
  const JD = gregorianToJD(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return (JD + 9) % 10;
}

// Chuyển ngày dương lịch sang số ngày Julius
function gregorianToJD(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}
function getTietKhiFromDate(month, day) {
  const input = `${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
  let result = "";

  for (let i = 0; i < tietKhiTable.length; i++) {
    const current = tietKhiTable[i];
    const next = tietKhiTable[i + 1] || tietKhiTable[0];
    if (input >= current.date && input < next.date) {
      result = current.name;
      break;
    }
  }

  return result || tietKhiTable[tietKhiTable.length - 1].name;
}

// "Lập Hạ"

const canMap = {
  甲: "Giáp",
  乙: "Ất",
  丙: "Bính",
  丁: "Đinh",
  戊: "Mậu",
  己: "Kỷ",
  庚: "Canh",
  辛: "Tân",
  壬: "Nhâm",
  癸: "Quý",
};

const chiMap = {
  子: "Tý",
  丑: "Sửu",
  寅: "Dần",
  卯: "Mão",
  辰: "Thìn",
  巳: "Tỵ",
  午: "Ngọ",
  未: "Mùi",
  申: "Thân",
  酉: "Dậu",
  戌: "Tuất",
  亥: "Hợi",
};

function convertCanChiToVietnamese(canChiStr) {
  if (!canChiStr || canChiStr.length < 2) return canChiStr;
  const can = canMap[canChiStr[0]] || canChiStr[0];
  const chi = chiMap[canChiStr[1]] || canChiStr[1];
  return `${can} ${chi}`;
}

export function convertIsoToLunarInfo(isoString) {
  const date = new Date(isoString);
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const lunarYear = lunar.getYear();
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const lunarDate = `${lunarYear}-${
    lunarMonth < 10 ? "0" + lunarMonth : lunarMonth
  }-${lunarDay < 10 ? "0" + lunarDay : lunarDay}`;
  return {
    solarDate: solar.toYmd(),
    lunarDate: lunarDate,
    year: convertCanChiToVietnamese(lunar.getYearInGanZhi()),
    month: convertCanChiToVietnamese(lunar.getMonthInGanZhi()),
    day: convertCanChiToVietnamese(lunar.getDayInGanZhi()),
    hour: {
      chi: chiMap[lunar.getTimeZhi()] || lunar.getTimeZhi(),
      canChi: getCanChiGio(date),
    },
    tietKhi: getTietKhiFromDate(solar.getMonth(), solar.getDay()),

    nguyetLenh: chiMap[lunar.getMonthZhi()] || lunar.getMonthZhi(),
    nhatThan: chiMap[lunar.getDayZhi()] || lunar.getDayZhi(), // sửa ở đây
  };
}

export async function getNguHanhTrangThai(chiMenh, ngayDuongLich) {
  if (!chiMenh || !ngayDuongLich) {
    throw new Error("Thiếu thông tin chi mệnh hoặc ngày dương lịch");
  }

  const [chi, menh] = chiMenh.toLowerCase().split("-");
  const [year, month, day] = ngayDuongLich.split("-").map(Number);

  if (!chi || !menh || !year || !month || !day) {
    throw new Error("Dữ liệu không hợp lệ: chiMenh hoặc ngày dương lịch");
  }

  // Chuyển đổi sang âm lịch
  const lunarDate = Solar.fromYmd(year, month, day).getLunar();
  const thangAmLich = lunarDate.getMonth();

  // Lấy danh sách mùa và các ngũ hành tương ứng
  const seasons = await SeasonalFiveElements.find();

  const matchedSeason = seasons.find((season) =>
    season.lunarMonths.includes(thangAmLich)
  );

  if (!matchedSeason) {
    return {
      error: true,
      message: `Không tìm thấy mùa ứng với tháng âm lịch: ${thangAmLich}`,
    };
  }

  const entries = Object.entries(matchedSeason.elements); // [ [vuong, "Mộc"], ... ]
  const found = entries.find(
    ([state, element]) => element.toLowerCase() === menh
  );

  if (!found) {
    return {
      error: true,
      message: `Không xác định được trạng thái ngũ hành cho mệnh: ${menh} vào tháng âm lịch ${thangAmLich}`,
    };
  }

  const vietnameseStateMap = {
    vuong: "Vượng",
    tuong: "Tướng",
    huu: "Hưu",
    tu: "Tù",
    tutu: "Tử",
  };

  const [stateKey, element] = found;
  const trangThai =
    vietnameseStateMap[stateKey.toLowerCase()] || "Không xác định";

  return {
    chi,
    menh,
    ngayDuongLich,
    thangAmLich,
    muaSinh: matchedSeason.season,
    trangThai,
    menhKhop: element,
  };
}

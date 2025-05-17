import dotenv from "dotenv";
import mongoose from "mongoose";
import DiaChi from "../models/DiaChi.js";
import ElementPhaseMap from "../models/ElementPhaseMap.js";
import LucThu from "../models/LucThu.js";
import NguHanh from "../models/NguHanh.js";
import QueDon from "../models/QueDon.js";
import SeasonalFiveElements from "../models/seasonalFiveElements.js";
import ThienCan from "../models/ThienCan.js";
import TruongSinhPhase from "../models/TruongSinhPhase.js";
import TuanKhong from "../models/TuanKhong.js";
dotenv.config();

// Hàm kết nối CSDL
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Đã kết nối MongoDB");
}

// Hàm ngắt kết nối
async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Đã ngắt kết nối MongoDB");
}

// Hàm seed dữ liệu
async function seedAll() {
  // Xoá dữ liệu cũ
  await ThienCan.deleteMany();
  await DiaChi.deleteMany();
  await QueDon.deleteMany();
  await NguHanh.deleteMany();
  console.log("🗑️ Đã xoá dữ liệu cũ");

  // Thiên Can
  const thienCanList = [
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
  const thienCanDocs = await ThienCan.insertMany(
    thienCanList.map((ten) => ({ ten }))
  );
  console.log("✅ Đã thêm Thiên Can");

  // Địa Chi
  const diaChiList = [
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
  const diaChiDocs = await DiaChi.insertMany(
    diaChiList.map((ten) => ({ ten }))
  );
  console.log("✅ Đã thêm Địa Chi");

  // Ngũ Hành
  await NguHanh.insertMany([
    { ten: "Kim", sinh: "Thủy", khac: "Mộc" },
    { ten: "Mộc", sinh: "Hỏa", khac: "Thổ" },
    { ten: "Thủy", sinh: "Mộc", khac: "Hỏa" },
    { ten: "Hỏa", sinh: "Thổ", khac: "Kim" },
    { ten: "Thổ", sinh: "Kim", khac: "Thủy" },
  ]);
  console.log("✅ Đã thêm Ngũ Hành");

  // Quẻ Đơn
  const queDonData = [
    { tenque: "Càn", mahatext: "111" },
    { tenque: "Đoài", mahatext: "011" },
    { tenque: "Ly", mahatext: "101" },
    { tenque: "Chấn", mahatext: "001" },
    { tenque: "Tốn", mahatext: "110" },
    { tenque: "Khảm", mahatext: "010" },
    { tenque: "Cấn", mahatext: "100" },
    { tenque: "Khôn", mahatext: "000" },
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  await QueDon.insertMany(
    queDonData.map((q) => ({
      tenque: q.tenque,
      mahatext: q.mahatext,
      thiencanquenoi: getRandom(thienCanDocs)._id,
      thiencanquengoai: getRandom(thienCanDocs)._id,
      diachiquenoi: [
        getRandom(diaChiDocs)._id,
        getRandom(diaChiDocs)._id,
        getRandom(diaChiDocs)._id,
      ],
      diachiquengoai: [
        getRandom(diaChiDocs)._id,
        getRandom(diaChiDocs)._id,
        getRandom(diaChiDocs)._id,
      ],
    }))
  );
  console.log("✅ Đã thêm Quẻ Đơn");
}
async function seedNguHanh() {
  // Xoá dữ liệu cũ
  await NguHanh.deleteMany();

  // Ngũ Hành
  await NguHanh.insertMany([
    { ten: "Kim", sinh: "Thủy", khac: "Mộc" },
    { ten: "Mộc", sinh: "Hỏa", khac: "Thổ" },
    { ten: "Thủy", sinh: "Mộc", khac: "Hỏa" },
    { ten: "Hỏa", sinh: "Thổ", khac: "Kim" },
    { ten: "Thổ", sinh: "Kim", khac: "Thủy" },
  ]);
  console.log("✅ Đã thêm Ngũ Hành");

  // Quẻ Đơn
}
async function seedDiaChiNguHanhOnly() {
  // Lấy danh sách Ngũ Hành hiện có từ database
  const nguHanhDocs = await NguHanh.find({});
  if (nguHanhDocs.length !== 5) {
    throw new Error("⚠️ Dữ liệu bảng Ngũ Hành không đầy đủ hoặc chưa có.");
  }

  // Xoá dữ liệu Địa Chi cũ
  await DiaChi.deleteMany();

  // Map Địa Chi -> Ngũ Hành
  const diaChiNguHanhMap = {
    Tý: "Thủy",
    Sửu: "Thổ",
    Dần: "Mộc",
    Mão: "Mộc",
    Thìn: "Thổ",
    Tỵ: "Hỏa",
    Ngọ: "Hỏa",
    Mùi: "Thổ",
    Thân: "Kim",
    Dậu: "Kim",
    Tuất: "Thổ",
    Hợi: "Thủy",
  };

  // Tạo danh sách Địa Chi có tham chiếu đúng tới _id của Ngũ Hành
  const diaChiDocs = await DiaChi.insertMany(
    Object.entries(diaChiNguHanhMap).map(([ten, tenNguHanh]) => {
      const nguhanh = nguHanhDocs.find((nh) => nh.ten === tenNguHanh);
      if (!nguhanh) throw new Error(`Không tìm thấy ngũ hành: ${tenNguHanh}`);
      return {
        ten,
        nguhanh: nguhanh._id,
      };
    })
  );

  console.log("✅ Đã thêm Địa Chi kèm Ngũ Hành");
  return diaChiDocs;
}
async function seedQueDonOnly() {
  // Lấy dữ liệu có sẵn từ các bảng liên quan
  const thienCanDocs = await ThienCan.find({});
  const diaChiDocs = await DiaChi.find({});
  const nguHanhDocs = await NguHanh.find({});

  if (
    thienCanDocs.length < 2 ||
    diaChiDocs.length < 6 ||
    nguHanhDocs.length === 0
  ) {
    throw new Error(
      "❌ Dữ liệu chưa đầy đủ trong ThienCan, DiaChi hoặc NguHanh"
    );
  }

  // Xoá dữ liệu cũ của QueDon
  await QueDon.deleteMany();

  // Dữ liệu mẫu của Quẻ Đơn
  const queDonData = [
    { tenque: "Càn", mahatext: "111", nguhanh: "Kim" },
    { tenque: "Đoài", mahatext: "011", nguhanh: "Kim" },
    { tenque: "Ly", mahatext: "101", nguhanh: "Hỏa" },
    { tenque: "Chấn", mahatext: "001", nguhanh: "Mộc" },
    { tenque: "Tốn", mahatext: "110", nguhanh: "Mộc" },
    { tenque: "Khảm", mahatext: "010", nguhanh: "Thủy" },
    { tenque: "Cấn", mahatext: "100", nguhanh: "Thổ" },
    { tenque: "Khôn", mahatext: "000", nguhanh: "Thổ" },
  ];

  // Hàm chọn ngẫu nhiên
  const getRandom = (arr, count = 1) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return count === 1 ? shuffled[0] : shuffled.slice(0, count);
  };

  // Chèn dữ liệu vào bảng QueDon
  await QueDon.insertMany(
    queDonData.map((q) => {
      const nguhanhDoc = nguHanhDocs.find((nh) => nh.ten === q.nguhanh);
      return {
        tenque: q.tenque,
        mahatext: q.mahatext,
        nguhanh: nguhanhDoc?._id,
        thiencanquenoi: getRandom(thienCanDocs)._id,
        thiencanquengoai: getRandom(thienCanDocs)._id,
        diachiquenoi: getRandom(diaChiDocs, 3).map((d) => d._id),
        diachiquengoai: getRandom(diaChiDocs, 3).map((d) => d._id),
      };
    })
  );

  console.log("✅ Đã thêm dữ liệu Quẻ Đơn");
}
async function seedQueDonFromNames() {
  // Lấy dữ liệu đã có
  const nguHanhDocs = await NguHanh.find({});
  const thienCanDocs = await ThienCan.find({});
  const diaChiDocs = await DiaChi.find({});

  // Tạo map lookup nhanh
  const nguHanhMap = Object.fromEntries(nguHanhDocs.map((n) => [n.ten, n]));
  const thienCanMap = Object.fromEntries(
    thienCanDocs.map((tc) => [tc.ten, tc])
  );
  const diaChiMap = Object.fromEntries(diaChiDocs.map((dc) => [dc.ten, dc]));

  // Dữ liệu đầu vào
  const queDonData = [
    {
      tenque: "Càn",
      mahatext: "111",
      nguhanh: "Kim",
      thiencanquenoi: ["Giáp"],
      thiencanquengoai: ["Nhâm"],
      diachiquenoi: ["Tý", "Dần", "Thìn"],
      diachiquengoai: ["Ngọ", "Thân", "Tuất"],
    },
    {
      tenque: "Khôn",
      mahatext: "000",
      nguhanh: "Thổ",
      thiencanquenoi: ["Ất"],
      thiencanquengoai: ["Quý"],
      diachiquenoi: ["Mùi", "Tị", "Mão"],
      diachiquengoai: ["Sửu", "Hợi", "Dậu"],
    },
    {
      tenque: "Cấn",
      mahatext: "001",
      nguhanh: "Thổ",
      thiencanquenoi: ["Bính"],
      thiencanquengoai: ["Bính"],
      diachiquenoi: ["Thìn", "Ngọ", "Thân"],
      diachiquengoai: ["Tuất", "Tý", "Dần"],
    },
    {
      tenque: "Đoài",
      mahatext: "011",
      nguhanh: "Kim",
      thiencanquenoi: ["Đinh"],
      thiencanquengoai: ["Đinh"],
      diachiquenoi: ["Tị", "Mão", "Sửu"],
      diachiquengoai: ["Hợi", "Dậu", "Mùi"],
    },
    {
      tenque: "Khảm",
      mahatext: "010",
      nguhanh: "Thủy",
      thiencanquenoi: ["Mậu"],
      thiencanquengoai: ["Mậu"],
      diachiquenoi: ["Dần", "Thìn", "Ngọ"],
      diachiquengoai: ["Thân", "Tuất", "Tý"],
    },
    {
      tenque: "Ly",
      mahatext: "101",
      nguhanh: "Hỏa",
      thiencanquenoi: ["Kỷ"],
      thiencanquengoai: ["Kỷ"],
      diachiquenoi: ["Mão", "Sửu", "Hợi"],
      diachiquengoai: ["Dậu", "Mùi", "Tị"],
    },
    {
      tenque: "Chấn",
      mahatext: "100",
      nguhanh: "Mộc",
      thiencanquenoi: ["Canh"],
      thiencanquengoai: ["Canh"],
      diachiquenoi: ["Tý", "Dần", "Thìn"],
      diachiquengoai: ["Ngọ", "Thân", "Tuất"],
    },
    {
      tenque: "Tốn",
      mahatext: "110",
      nguhanh: "Mộc",
      thiencanquenoi: ["Tân"],
      thiencanquengoai: ["Tân"],
      diachiquenoi: ["Sửu", "Hợi", "Dậu"],
      diachiquengoai: ["Mùi", "Tị", "Mão"],
    },
  ];

  // Xoá dữ liệu cũ
  await QueDon.deleteMany();

  // Insert
  const queDonDocs = queDonData.map((q) => {
    const nguhanh = nguHanhMap[q.nguhanh]?._id;

    const thiencanquenoi = q.thiencanquenoi
      .map((t) => thienCanMap[t]?._id)
      .filter(Boolean)[0]; // lấy 1 phần tử (vì là 1 ObjectId)

    const thiencanquengoai = q.thiencanquengoai
      .map((t) => thienCanMap[t]?._id)
      .filter(Boolean)[0];

    const diachiquenoi = q.diachiquenoi
      .map((d) => diaChiMap[d]?._id)
      .filter(Boolean);

    const diachiquengoai = q.diachiquengoai
      .map((d) => diaChiMap[d]?._id)
      .filter(Boolean);

    return {
      tenque: q.tenque,
      mahatext: q.mahatext,
      nguhanh,
      thiencanquenoi,
      thiencanquengoai,
      diachiquenoi,
      diachiquengoai,
    };
  });

  await QueDon.insertMany(queDonDocs);
  console.log("✅ Đã thêm Quẻ Đơn từ tên");
}

// Hàm main chỉ xử lý luồng chạy
async function main() {
  try {
    await connectDB();
    // await seedVongTruongSinh();
    await seedSeasonalFiveElements();
    await disconnectDB();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
}

main();
const queDonData = [
  {
    tenque: "Càn",
    mahatext: "111",
    nguhanh: "Kim",
    thiencanquenoi: ["Giáp"],
    thiencanquengoai: ["Nhâm"],
    diachiquenoi: ["Tý", "Sửu", "Dần"],
    diachiquengoai: ["Mão", "Thìn", "Tỵ"],
  },
];

async function seedThienCan() {
  await ThienCan.deleteMany();
  await LucThu.deleteMany();

  // 1. Insert dữ liệu LucThu
  const lucThuNames = [
    "Thanh Long",
    "Chu Tước",
    "Huyền Vũ",
    "Bạch Hổ",
    "Câu Trần",
    "Đằng Xà",
  ];

  const insertedLucThu = await LucThu.insertMany(
    lucThuNames.map((ten) => ({ ten }))
  );

  // 2. Tạo map từ tên => _id
  const lucThuMap = {};
  insertedLucThu.forEach((lt) => {
    lucThuMap[lt.ten] = lt._id;
  });

  // 3. Dữ liệu ThienCan (vẫn là tên LucThu)
  const thiencanDataRaw = [
    {
      ten: "Giáp",
      lucThu: [
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
      ],
    },
    {
      ten: "Ất",
      lucThu: [
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
      ],
    },
    {
      ten: "Bính",
      lucThu: [
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
      ],
    },
    {
      ten: "Đinh",
      lucThu: [
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
      ],
    },
    {
      ten: "Mậu",
      lucThu: [
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
      ],
    },
    {
      ten: "Kỷ",
      lucThu: [
        "Đằng Xà",
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
      ],
    },
    {
      ten: "Canh",
      lucThu: [
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
      ],
    },
    {
      ten: "Tân",
      lucThu: [
        "Bạch Hổ",
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
      ],
    },
    {
      ten: "Nhâm",
      lucThu: [
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
      ],
    },
    {
      ten: "Quý",
      lucThu: [
        "Huyền Vũ",
        "Thanh Long",
        "Chu Tước",
        "Câu Trần",
        "Đằng Xà",
        "Bạch Hổ",
      ],
    },
  ];

  // 4. Chuyển tên LucThu thành _id
  const thiencanData = thiencanDataRaw.map((tc) => ({
    ten: tc.ten,
    lucThu: tc.lucThu.map((name) => lucThuMap[name]),
  }));

  // 5. Insert vào ThienCan
  await ThienCan.insertMany(thiencanData);
  console.log("✅ Đã thêm Thiên Can kèm đúng LucThu");
}

async function seedTuanKhong() {
  const tuankhongData = [
    {
      tuangiap: [
        "Giáp Tý",
        "Ất Sửu",
        "Bính Dần",
        "Đinh Mão",
        "Mậu Thìn",
        "Kỷ Tỵ",
        "Canh Ngọ",
        "Tân Mùi",
        "Nhâm Thân",
        "Quý Dậu",
      ],
      tuankhong: ["Tuất,Hợi"],
    },
    {
      tuangiap: [
        "Giáp Tuất",
        "Ất Hợi",
        "Bính Tý",
        "Đinh Sửu",
        "Mậu Dần",
        "Kỷ Mão",
        "Canh Thìn",
        "Tân Tỵ",
        "Nhâm Ngọ",
        "Quý Mùi",
      ],
      tuankhong: ["Thân,Dậu"],
    },
    {
      tuangiap: [
        "Giáp Thân",
        "Ất Dậu",
        "Bính Tuất",
        "Đinh Hợi",
        "Mậu Tý",
        "Kỷ Sửu",
        "Canh Dần",
        "Tân Mão",
        "Nhâm Thìn",
        "Quý Tỵ",
      ],
      tuankhong: ["Ngọ,Mùi"],
    },
    {
      tuangiap: [
        "Giáp Ngọ",
        "Ất Mùi",
        "Bính Thân",
        "Đinh Dậu",
        "Mậu Tuất",
        "Kỷ Hợi",
        "Canh Tý",
        "Tân Sửu",
        "Nhâm Dần",
        "Quý Mão",
      ],
      tuankhong: ["Thìn,Tỵ"],
    },
    {
      tuangiap: [
        "Giáp Thìn",
        "Ất Tỵ",
        "Bính Ngọ",
        "Đinh Mùi",
        "Mậu Thân",
        "Kỷ Dậu",
        "Canh Tuất",
        "Tân Hợi",
        "Nhâm Tý",
        "Quý Sửu",
      ],
      tuankhong: ["Dần,Mão"],
    },
    {
      tuangiap: [
        "Giáp Dần",
        "Ất Mão",
        "Bính Thìn",
        "Đinh Tỵ",
        "Mậu Ngọ",
        "Kỷ Mùi",
        "Canh Thân",
        "Tân Dậu",
        "Nhâm Tuất",
        "Quý Hợi",
      ],
      tuankhong: ["Tý,Sửu"],
    },
  ];
  await TuanKhong.deleteMany();
  await TuanKhong.insertMany(tuankhongData);
  console.log("✅ Đã thêm Tuan Không");
}
export async function seedVongTruongSinh() {
  try {
    // Dữ liệu Trường Sinh (12 giai đoạn)
    const phaseData = [
      { name: "Trường Sinh", description: "Bắt đầu sinh ra", order: 1 },
      { name: "Mộc Dục", description: "Tắm rửa", order: 2 },
      { name: "Quán Đới", description: "Mặc áo", order: 3 },
      { name: "Lâm Quan", description: "Trưởng thành", order: 4 },
      { name: "Đế Vượng", description: "Cực thịnh", order: 5 },
      { name: "Suy", description: "Bắt đầu suy giảm", order: 6 },
      { name: "Bệnh", description: "Có bệnh", order: 7 },
      { name: "Tử", description: "Chết", order: 8 },
      { name: "Mộ", description: "Chôn", order: 9 },
      { name: "Tuyệt", description: "Tan rã", order: 10 },
      { name: "Thai", description: "Có mầm sống mới", order: 11 },
      { name: "Dưỡng", description: "Nuôi thai", order: 12 },
    ];

    // Dữ liệu mapping Hành - Can - Chi Trường Sinh
    const mapData = [
      { hanh: "Kim", can: ["Canh", "Tân"], truongSinhChi: "Tỵ" },
      { hanh: "Mộc", can: ["Giáp", "Ất"], truongSinhChi: "Hợi" },
      { hanh: "Thủy", can: ["Nhâm", "Quý"], truongSinhChi: "Thân" },
      { hanh: "Hỏa", can: ["Bính", "Đinh"], truongSinhChi: "Dần" },
      { hanh: "Thổ", can: ["Mậu", "Kỷ"], truongSinhChi: "Thân" },
    ];

    // Xoá dữ liệu cũ
    await TruongSinhPhase.deleteMany();
    await ElementPhaseMap.deleteMany();

    // Thêm dữ liệu mới
    await TruongSinhPhase.insertMany(phaseData);
    await ElementPhaseMap.insertMany(mapData);

    console.log("✅ Dữ liệu vòng Trường Sinh đã được khởi tạo thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu vòng Trường Sinh:", error);
  }
}
async function seedSeasonalFiveElements() {
  const seedData = [
    {
      season: "Xuân",
      lunarMonths: [1, 2],
      daysRange: "Từ 01/01 đến 12/03",
      durationDays: 72,
      elements: {
        vuong: "Mộc",
        tuong: "Hỏa",
        huu: "Thủy",
        tu: "Kim",
        tuTu: "Thổ",
      },
    },
    {
      season: "Hạ",
      lunarMonths: [4, 5],
      daysRange: "Từ 01/04 đến 12/06",
      durationDays: 72,
      elements: {
        vuong: "Hỏa",
        tuong: "Thổ",
        huu: "Mộc",
        tu: "Kim",
        tuTu: "Thủy",
      },
    },
    {
      season: "Thu",
      lunarMonths: [7, 8],
      daysRange: "Từ 01/07 đến 12/09",
      durationDays: 72,
      elements: {
        vuong: "Kim",
        tuong: "Thủy",
        huu: "Thổ",
        tu: "Hỏa",
        tuTu: "Mộc",
      },
    },
    {
      season: "Đông",
      lunarMonths: [10, 11],
      daysRange: "Từ 01/10 đến 12/12",
      durationDays: 72,
      elements: {
        vuong: "Thủy",
        tuong: "Mộc",
        huu: "Kim",
        tu: "Thổ",
        tuTu: "Hỏa",
      },
    },
    {
      season: "Tháng Tứ Quý",
      lunarMonths: [3, 6, 9, 12],
      daysRange: "Từ ngày 13 đến 30 (các tháng 3, 6, 9, 12)",
      durationDays: 72,
      elements: {
        vuong: "Thổ",
        tuong: "Kim",
        huu: "Hỏa",
        tu: "Mộc",
        tuTu: "Thủy",
      },
    },
  ];
  await SeasonalFiveElements.deleteMany();
  await SeasonalFiveElements.insertMany(seedData);
  console.log("✅ Đã thêm Dữ liệu vòng Trường Sinh");
}

import DiaChi from "../models/DiaChi.js";
import ElementPhaseMap from "../models/ElementPhaseMap.js";
import LichSu from "../models/LichSu.js";
import LucThu from "../models/LucThu.js";
import NguHanh from "../models/NguHanh.js";
import Que from "../models/Que.js"; // tương tự nếu dùng default export
import QueDon from "../models/QueDon.js";
import QueKep from "../models/QueKep.js";
import ThienCan from "../models/ThienCan.js";
import TruongSinhPhase from "../models/TruongSinhPhase.js";
import TuanKhong from "../models/TuanKhong.js";
import {
  convertIsoToLunarInfo,
  getNguHanhTrangThai,
} from "../utils/datetime.js";
export const traQueKep = async (req, res) => {
  try {
    // Lấy dữ liệu ngũ hành
    const nguhanh = await NguHanh.find();

    // Lấy dữ liệu từ body request
    const { haos, hao_dong = [], ngaylapque } = req.body;

    // Kiểm tra số lượng hào có đúng 6 hay không
    if (!Array.isArray(haos) || haos.length !== 6) {
      return res.status(400).json({ message: "Phải nhập đúng 6 hào" });
    }

    // Chuyển ngày dương sang thông tin âm lịch
    const lunarInfo = convertIsoToLunarInfo(ngaylapque);

    // Tách 6 hào thành 2 quẻ đơn: 3 hào trong và 3 hào ngoài
    const mahatextNoi = haos.slice(0, 3).join("");
    const mahatextNgoai = haos.slice(3).join("");

    // Tìm quẻ đơn trong DB theo mã hào
    const queNgoai = await QueDon.findOne({ mahatext: mahatextNgoai });
    const queNoi = await QueDon.findOne({ mahatext: mahatextNoi });
    // Lấy thông tin thiên can, địa chi ngày và tháng
    const [thiencanngay, diachingay] = lunarInfo.day.split(" ");
    const [thiencanthang, diachithang] = lunarInfo.month.split(" ");

    // Tìm ngũ hành của địa chi ngày
    const nguhanhngay = await DiaChi.findOne({ ten: diachingay })
      .select("-_id")
      .populate({
        path: "nguhanh",
        select: "-_id ten",
      });

    // Tìm ngũ hành của địa chi tháng
    const nguhanhthang = await DiaChi.findOne({ ten: diachithang })
      .select("-_id")
      .populate({
        path: "nguhanh",
        select: "-_id ten",
      });

    // Nếu không tìm thấy quẻ đơn thì trả về lỗi
    if (!queNgoai || !queNoi) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy Quẻ Đơn phù hợp" });
    }

    // Tìm quẻ kép theo quẻ nội và quẻ ngoại
    const queKep = await QueKep.findOne({
      queNoi: queNoi._id,
      queNgoai: queNgoai._id,
    }).populate({
      path: "queNoi queNgoai thuoccung",
      populate: [
        { path: "thiencanquenoi thiencanquengoai", select: "ten" },
        {
          path: "diachiquenoi diachiquengoai",
          select: "ten",
          populate: [{ path: "nguhanh", select: "ten sinh khac" }],
        },
        { path: "nguhanh", select: "ten sinh khac" },
      ],
    });

    if (!queKep) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy Quẻ Kép phù hợp" });
    }

    // Khởi tạo các biến lưu kết quả
    const ketQua = [];
    const ketQuaBien = [];
    let listvongtruongsinh = [];
    let listvongtruongsinhbien = [];
    let listvongtruongsinhthang = [];
    let listvongtruongsinhthangbien = [];
    let listtuthoi = [];
    let listtuthoibien = [];

    // Xử lý quẻ nội
    if (queKep.queNoi?.diachiquenoi) {
      for (const diachi of queKep.queNoi.diachiquenoi) {
        ketQua.push(soSanhNguHanh(queKep.thuoccung.nguhanh, diachi.nguhanh));

        const result = await traTrangThaiTruongSinh(
          diachi.nguhanh.ten,
          diachingay
        );
        const result1 = await traTrangThaiTruongSinh(
          diachi.nguhanh.ten,
          diachithang
        );
        const result2 = await getNguHanhTrangThai(
          `${diachi.ten}-${diachi.nguhanh.ten}`,
          lunarInfo.solarDate
        );

        listvongtruongsinh.push(result);
        listvongtruongsinhthang.push(result1);
        listtuthoi.push(result2);
      }
    }

    // Xử lý quẻ ngoại
    if (queKep.queNgoai?.diachiquengoai) {
      for (const diachi of queKep.queNgoai.diachiquengoai) {
        ketQua.push(soSanhNguHanh(queKep.thuoccung.nguhanh, diachi.nguhanh));

        const result = await traTrangThaiTruongSinh(
          diachi.nguhanh.ten,
          diachingay
        );
        const result1 = await traTrangThaiTruongSinh(
          diachi.nguhanh.ten,
          diachithang
        );
        const result2 = await getNguHanhTrangThai(
          `${diachi.ten}-${diachi.nguhanh.ten}`,
          lunarInfo.solarDate
        );

        listvongtruongsinh.push(result);
        listvongtruongsinhthang.push(result1);
        listtuthoi.push(result2);
      }
    }

    // Lục Thư của ngày
    const lucthu = await ThienCan.find({
      ten: lunarInfo.day.split(" ")[0],
    }).populate({
      path: "lucThu",
      select: "-_id ten",
    });

    // Thông tin Tuần Không
    const tuankhonginfo = await TuanKhong.findOne({
      tuangiap: lunarInfo.day,
    }).select("tuankhong");

    // Xử lý quẻ biến nếu có hào động
    let queKepBien = null;
    let listdiachibien = [];
    let listthiencanbien = [];

    if (hao_dong.length > 0) {
      const haosBien = [...haos];
      hao_dong.forEach((i) => {
        if (i >= 1 && i <= 6) {
          haosBien[i - 1] = haosBien[i - 1] === 1 ? 0 : 1;
        }
      });

      const mahatextNoiBien = haosBien.slice(0, 3).join("");
      const mahatextNgoaiBien = haosBien.slice(3).join("");

      const queNgoaiBien = await QueDon.findOne({
        mahatext: mahatextNgoaiBien,
      });

      const queNoiBien = await QueDon.findOne({ mahatext: mahatextNoiBien });

      if (queNgoaiBien && queNoiBien) {
        queKepBien = await QueKep.findOne({
          queNoi: queNoiBien._id,
          queNgoai: queNgoaiBien._id,
        }).populate({
          path: "queNoi queNgoai thuoccung",
          populate: [
            { path: "thiencanquenoi thiencanquengoai", select: "ten" },
            {
              path: "diachiquenoi diachiquengoai",
              select: "ten",
              populate: [{ path: "nguhanh", select: "ten sinh khac" }],
            },
            { path: "nguhanh", select: "ten sinh khac" },
          ],
        });

        if (queKepBien) {
          // Xử lý quẻ nội biến
          if (queKepBien.queNoi?.diachiquenoi) {
            for (const diachi of queKepBien.queNoi.diachiquenoi) {
              ketQuaBien.push(
                soSanhNguHanh(queKep.thuoccung.nguhanh, diachi.nguhanh)
              );

              const result = await traTrangThaiTruongSinh(
                diachi.nguhanh.ten,
                diachingay
              );
              const result1 = await traTrangThaiTruongSinh(
                diachi.nguhanh.ten,
                diachithang
              );
              const result2 = await getNguHanhTrangThai(
                `${diachi.ten}-${diachi.nguhanh.ten}`,
                lunarInfo.solarDate
              );

              listvongtruongsinhbien.push(result);
              listvongtruongsinhthangbien.push(result1);
              listtuthoibien.push(result2);
            }
          }

          // Xử lý quẻ ngoại biến
          if (queKepBien.queNgoai?.diachiquengoai) {
            for (const diachi of queKepBien.queNgoai.diachiquengoai) {
              ketQuaBien.push(
                soSanhNguHanh(queKep.thuoccung.nguhanh, diachi.nguhanh)
              );

              const result = await traTrangThaiTruongSinh(
                diachi.nguhanh.ten,
                diachingay
              );
              const result1 = await traTrangThaiTruongSinh(
                diachi.nguhanh.ten,
                diachithang
              );
              const result2 = await getNguHanhTrangThai(
                `${diachi.ten}-${diachi.nguhanh.ten}`,
                lunarInfo.solarDate
              );

              listvongtruongsinhbien.push(result);
              listvongtruongsinhthangbien.push(result1);
              listtuthoibien.push(result2);
            }
          }
        }
      }
    }

    // Trả về kết quả
    // return res.status(200).json({
    //   queKep,
    //   queKepBien,
    //   listvongtruongsinh,
    //   listvongtruongsinhbien,
    //   listvongtruongsinhthang,
    //   listvongtruongsinhthangbien,
    //   lucthu,
    //   listtuthoi,
    //   listtuthoibien,
    //   tuankhonginfo,
    //   ketQua,
    //   ketQuaBien,
    // });
    console.log(ketQua, queKep.hao_the);
    const listphucthan = await timphucthan(ketQua, queKep.thuoccung);
    const listtheung = timtheung(ketQua, queKep.hao_the);
    const listquaithan = getQuaiThan(queKep.hao_the, haos);

    return res.status(200).json({
      message: "success",
      data: {
        queKep: {
          ten: queKep?.tenque ?? null,
          mahatext: queKep?.mahatext ?? null,
          queNoi: {
            thiencanquenoi:
              queKep?.queNoi?.diachiquenoi?.map(
                (item) =>
                  `${queKep?.queNoi?.thiencanquenoi?.ten ?? ""} ${
                    item?.ten ?? ""
                  }`
              ) ?? [],
            diachiquenoi:
              queKep?.queNoi?.diachiquenoi?.map(
                (item) => `${item?.ten ?? ""}-${item?.nguhanh?.ten ?? ""}`
              ) ?? [],
            lucthan: ketQua?.slice(0, 3) ?? [],
            tuthoi:
              listtuthoi?.slice(0, 3)?.map((item) => item?.trangThai ?? null) ??
              [],
            truongsinh:
              listvongtruongsinh
                ?.slice(0, 3)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinhthang:
              listvongtruongsinhthang
                ?.slice(0, 3)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            lucthu:
              lucthu?.[0]?.lucThu
                ?.slice(0, 3)
                ?.map((item) => item?.ten ?? null) ?? [],
          },
          queNgoai: {
            thiencanquengoai:
              queKep?.queNgoai?.diachiquengoai?.map(
                (item) =>
                  `${queKep?.queNgoai?.thiencanquengoai?.ten ?? ""} ${
                    item?.ten ?? ""
                  }`
              ) ?? [],
            diachiquengoai:
              queKep?.queNgoai?.diachiquengoai?.map(
                (item) => `${item?.ten ?? ""}-${item?.nguhanh?.ten ?? ""}`
              ) ?? [],
            lucthan: ketQua?.slice(3, 6) ?? [],
            tuthoi:
              listtuthoi?.slice(3, 6)?.map((item) => item?.trangThai ?? null) ??
              [],
            truongsinh:
              listvongtruongsinh
                ?.slice(3, 6)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinhthang:
              listvongtruongsinhthang
                ?.slice(3, 6)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            lucthu:
              lucthu?.[0]?.lucThu
                ?.slice(3, 6)
                ?.map((item) => item?.ten ?? null) ?? [],
          },
          thuoccung: queKep?.thuoccung?.ten ?? null,
          hao_the: queKep?.hao_the ?? null,
          dien_giai: queKep?.dien_giai ?? null,
          dac_diem_que: queKep?.dac_diem_que ?? null,
          ten_bieu_tuong: queKep?.ten_bieu_tuong ?? null,
          phucthan: listphucthan ?? [],
          theung: listtheung ?? [],
          quaithan: listquaithan ?? [],
        },
        queBien: {
          ten: queKepBien?.tenque ?? null,
          mahatext: queKepBien?.mahatext ?? null,
          queNoi: {
            thiencanquenoi:
              queKepBien?.queNoi?.diachiquenoi?.map(
                (item) =>
                  `${queKepBien?.queNoi?.thiencanquenoi?.ten ?? ""} ${
                    item?.ten ?? ""
                  }`
              ) ?? [],
            diachiquenoi:
              queKepBien?.queNoi?.diachiquenoi?.map(
                (item) => `${item?.ten ?? ""}-${item?.nguhanh?.ten ?? ""}`
              ) ?? [],
            lucthan: ketQuaBien?.slice(0, 3) ?? [],
            tuthoi:
              listtuthoibien
                ?.slice(0, 3)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinh:
              listvongtruongsinhbien
                ?.slice(0, 3)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinhthang:
              listvongtruongsinhthangbien
                ?.slice(0, 3)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            lucthu:
              lucthu?.[0]?.lucThu
                ?.slice(0, 3)
                ?.map((item) => item?.ten ?? null) ?? [],
          },
          queNgoai: {
            thiencanquengoai:
              queKepBien?.queNgoai?.diachiquengoai?.map(
                (item) =>
                  `${queKepBien?.queNgoai?.thiencanquengoai?.ten ?? ""} ${
                    item?.ten ?? ""
                  }`
              ) ?? [],
            diachiquengoai:
              queKepBien?.queNgoai?.diachiquengoai?.map(
                (item) => `${item?.ten ?? ""}-${item?.nguhanh?.ten ?? ""}`
              ) ?? [],
            lucthan: ketQuaBien?.slice(3, 6) ?? [],
            tuthoi:
              listtuthoibien
                ?.slice(3, 6)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinh:
              listvongtruongsinhbien
                ?.slice(3, 6)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            truongsinhthang:
              listvongtruongsinhthangbien
                ?.slice(3, 6)
                ?.map((item) => item?.trangThai ?? null) ?? [],
            lucthu:
              lucthu?.[0]?.lucThu
                ?.slice(3, 6)
                ?.map((item) => item?.ten ?? null) ?? [],
          },
          dien_giai: queKepBien?.dien_giai ?? null,
          dac_diem_que: queKepBien?.dac_diem_que ?? null,
          ten_bieu_tuong: queKepBien?.ten_bieu_tuong ?? null,
        },
        tuankhong: tuankhonginfo?.tuankhong ?? null,
        ngaylapque: lunarInfo ?? null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

async function timphucthan(listlucthan, quethuan) {
  const lucthantong = ["Huynh đệ", "Quan quỷ", "Thê tài", "Phụ mẫu", "Tử tôn"];

  // 1. Xác định các Lục Thân bị thiếu trong quẻ chính
  const lucthanthieu = lucthantong.filter(
    (than) => !listlucthan.includes(than)
  );

  // 2. Tìm các Lục Thân bị thiếu trong quẻ thuần và lấy cả vị trí + địa chi
  let phucThanList = [];

  if (quethuan?.diachiquenoi) {
    for (let i = 0; i < quethuan.diachiquenoi.length; i++) {
      const diachi = quethuan.diachiquenoi[i];
      const lt = soSanhNguHanh(quethuan.nguhanh, diachi.nguhanh);
      if (lucthanthieu.includes(lt)) {
        phucThanList.push({
          lucthan: lt,
          viTri: `Hào Nội ${i + 1}`,
          diaChi: `${diachi.ten}-${diachi.nguhanh.ten}`,
        });
      }
    }
  }

  if (quethuan?.diachiquengoai) {
    for (let i = 0; i < quethuan.diachiquengoai.length; i++) {
      const diachi = quethuan.diachiquengoai[i];
      const lt = soSanhNguHanh(quethuan.nguhanh, diachi.nguhanh);
      if (lucthanthieu.includes(lt)) {
        phucThanList.push({
          lucthan: lt,
          viTri: `Hào Ngoại ${i + 1}`,
          diaChi: `${diachi.ten}-${diachi.nguhanh.ten}`,
        });
      }
    }
  }

  return phucThanList;
}

async function traVongTruongSinhTheoTamHop(diachi) {
  const tamHopCucMap = [
    { hanh: "Mộc", chi: ["Hợi", "Mão", "Mùi"] },
    { hanh: "Kim", chi: ["Tỵ", "Dậu", "Sửu"] },
    { hanh: "Thủy", chi: ["Thân", "Tý", "Thìn"] },
    { hanh: "Hỏa", chi: ["Dần", "Ngọ", "Tuất"] },
  ];

  const allChi = [
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

  // 1. Tìm hành cục của địa chi
  const tamHop = tamHopCucMap.find((cuc) => cuc.chi.includes(diachi));

  if (!tamHop) {
    console.log(`❌ Không tìm thấy Tam Hợp Cục cho địa chi ${diachi}`);
    return null;
  }

  const hanh = tamHop.hanh;

  // 2. Tra chi bắt đầu vòng Trường Sinh theo hành cục
  const mapping = await ElementPhaseMap.findOne({ hanh });
  if (!mapping) {
    console.log(`❌ Không tìm thấy vòng Trường Sinh cho hành ${hanh}`);
    return null;
  }

  const startChi = mapping.truongSinhChi;

  // 3. Tính thứ tự
  const startIndex = allChi.indexOf(startChi);
  const chiIndex = allChi.indexOf(diachi);

  if (startIndex === -1 || chiIndex === -1) {
    console.log("❌ Địa chi không hợp lệ.");
    return null;
  }

  const phaseIndex = (chiIndex - startIndex + 12) % 12;

  const phase = await TruongSinhPhase.findOne({ order: phaseIndex + 1 });

  if (!phase) {
    console.log("❌ Không tìm thấy giai đoạn Trường Sinh.");
    return null;
  }

  return phase.name;
}
async function traTrangThaiTruongSinh(nguhanh, diaChi) {
  const allChi = [
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

  // Bước 1: Lấy vòng Trường Sinh theo ngũ hành truyền vào
  const mapping = await ElementPhaseMap.findOne({ hanh: nguhanh });
  if (!mapping) {
    console.log(`❌ Không tìm thấy vòng Trường Sinh cho hành ${nguhanh}`);
    return null;
  }

  const startChi = mapping.truongSinhChi;

  const startIndex = allChi.indexOf(startChi);
  const chiIndex = allChi.indexOf(diaChi);

  if (startIndex === -1 || chiIndex === -1) {
    console.log("❌ Địa chi không hợp lệ.");
    return null;
  }

  // Bước 2: Tính vị trí của địa chi trong vòng Trường Sinh
  const phaseIndex = (chiIndex - startIndex + 12) % 12;

  // Bước 3: Lấy trạng thái
  const phase = await TruongSinhPhase.findOne({ order: phaseIndex + 1 });

  if (!phase) {
    console.log("❌ Không tìm thấy giai đoạn Trường Sinh.");
    return null;
  }

  return {
    hanh: nguhanh,
    truongSinhBatDauTai: startChi,
    diaChi: diaChi,
    trangThai: phase.name,
  };
}

async function traVongTruongSinh(nguhanh, diachi) {
  const allChi = [
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

  const mapping = await ElementPhaseMap.findOne({ hanh: nguhanh });
  if (!mapping) return null;

  const startChi = mapping.truongSinhChi;

  const startIndex = allChi.indexOf(startChi);
  const chiIndex = allChi.indexOf(diachi);

  if (startIndex === -1 || chiIndex === -1) return null;

  const phaseIndex = (chiIndex - startIndex + 12) % 12;

  const phase = await TruongSinhPhase.findOne({ order: phaseIndex + 1 });
  if (!phase) return null;

  return phase.name; // ✅ Trả về tên giai đoạn
}

function getQuaiThan(vitrithe, listQue) {
  const checkamduong = listQue[vitrithe - 1];
  const listQuaiThan =
    checkamduong == 0
      ? ["Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
      : ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ"];
  if (vitrithe < 0 || vitrithe >= listQuaiThan) {
    throw new Error("Vị trí bắt đầu không hợp lệ");
  }

  return listQuaiThan[vitrithe - 1];
}
function timtheung(que, vitrihaothe) {
  const n = que.length;
  if (vitrihaothe < 0 || vitrihaothe >= n) {
    throw new Error("Vị trí bắt đầu không hợp lệ");
  }
  const first = que[vitrihaothe - 1];
  const secondIndex = (vitrihaothe - 3 + n) % n;
  const second = que[secondIndex - 1];
  return [first, second];
}
function soSanhNguHanh(nguhanhquetong, nguhanhdiachi) {
  const tennguhanhquetong = nguhanhquetong.ten;
  const tennguhanhdiachi = nguhanhdiachi.ten;

  var ketQua = "";

  if (nguhanhdiachi.sinh.includes(tennguhanhquetong)) {
    ketQua = "Phụ mẫu";
  }
  if (nguhanhquetong.sinh.includes(tennguhanhdiachi)) {
    ketQua = "Tử tôn";
  }

  if (nguhanhdiachi.khac.includes(tennguhanhquetong)) {
    ketQua = "Quan quỷ";
  }
  if (nguhanhquetong.khac.includes(tennguhanhdiachi)) {
    ketQua = "Thê tài";
  }

  if (tennguhanhdiachi === tennguhanhquetong) {
    ketQua = "Huynh đệ";
  }

  return ketQua;
}

// Lấy danh sách Quẻ Đơn
export const getQueDon = async (req, res) => {
  try {
    const list = await QueDon.find().select("tenque mahatext");
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách quẻ đơn", error });
  }
};

// Lấy danh sách Quẻ Kép
export const getQueKep = async (req, res) => {
  try {
    const list = await QueKep.find().populate({
      path: "queNoi queNgoai",
      populate: [
        { path: "thiencanquenoi thiencanquengoai", select: "ten" },
        { path: "diachiquenoi diachiquengoai", select: "ten" },
        { path: "nguhanh", select: "ten sinh khac" },
      ],
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách quẻ kép", error });
  }
};

// Thêm Quẻ Kép
export const createQueKep = async (req, res) => {
  try {
    const {
      queNoi,
      queNgoai,
      tenque,
      mahatext,
      dien_giai,
      dac_diem_que,
      ten_bieu_tuong,
      thuoccung,
      hao_the,
    } = req.body;
    const newQueKep = new QueKep({
      queNoi,
      queNgoai,
      tenque,
      mahatext,
      dien_giai,
      dac_diem_que,
      ten_bieu_tuong,
      thuoccung,
      hao_the,
    });

    const savedQueKep = await newQueKep.save();
    res.status(201).json(savedQueKep);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm quẻ kép", error });
  }
};
export const updateQueKep = async (req, res) => {
  try {
    const { id } = req.params;

    // Danh sách các trường được phép cập nhật
    const allowedFields = [
      "queDon1",
      "queDon2",
      "tenque",
      "mahatext",
      "dien_giai",
      "dac_diem_que",
      "ten_bieu_tuong",
      "thuoccung",
      "hao_the",
    ];

    // Tạo object chỉ chứa những trường đã được truyền lên
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedQueKep = await QueKep.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedQueKep) {
      return res.status(404).json({ message: "Quẻ Kép không tồn tại" });
    }

    res.status(200).json(updatedQueKep);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật quẻ kép", error });
  }
};

export const getThienCan = async (req, res) => {
  try {
    const listLucThu = await LucThu.find();
    const list = await ThienCan.find().populate({
      path: "lucThu",
      select: "-_id ten",
    });
    res.status(200).json({ list, listLucThu });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách thiên can", error });
  }
};

export const getDiaChi = async (req, res) => {
  try {
    const list = await DiaChi.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách địa chi", error });
  }
};
export async function updateQueDon(req, res) {
  try {
    const { thiencanquenoi, thiencanquengoai, diachiquenoi, diachiquengoai } =
      req.body;

    // Kiểm tra đầu vào (có thể thêm kiểm tra kỹ hơn)
    if (
      !thiencanquenoi ||
      !thiencanquengoai ||
      !Array.isArray(diachiquenoi) ||
      !Array.isArray(diachiquengoai)
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu hoặc sai định dạng dữ liệu." });
    }

    // Cập nhật quẻ đơn
    const updated = await QueDon.findByIdAndUpdate(
      req.params.id,
      {
        thiencanquenoi,
        thiencanquengoai,
        diachiquenoi,
        diachiquengoai,
      },
      { new: true }
    ).populate("thiencanquenoi thiencanquengoai diachiquenoi diachiquengoai");

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy quẻ đơn." });
    }

    res.json({ message: "✅ Đã cập nhật quẻ đơn", que: updated });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
export async function traQue(req, res) {
  try {
    const { hao } = req.body;

    if (!Array.isArray(hao) || hao.length !== 6) {
      return res.status(400).json({ error: "Phải nhập đúng 6 hào" });
    }

    const goc = hao.map((h) => h.am_duong);
    const ma_que = goc.join("");
    const queGoc = await Que.findOne({ ma_hexagram: ma_que });

    let bien = [...goc];
    let hasDong = false;

    hao.forEach((h, i) => {
      if (h.dong) {
        bien[i] = 1 - bien[i];
        hasDong = true;
      }
    });

    const ma_que_bien = hasDong ? bien.join("") : null;
    const queBien = hasDong
      ? await Que.findOne({ ma_hexagram: ma_que_bien })
      : null;

    await LichSu.create({ hao, ma_que, ma_que_bien });

    res.json({
      ma_que,
      ten_que: queGoc ? queGoc.ten_que : "Không tìm thấy",
      ma_que_bien: ma_que_bien,
      ten_que_bien: queBien ? queBien.ten_que : "Không tìm thấy",
    });
  } catch (error) {
    console.error("❌ Lỗi xử lý traQue:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
}

export async function lichSu(req, res) {
  try {
    const lichSuList = await LichSu.find().sort({ createdAt: -1 }).limit(20);
    res.json(lichSuList);
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
}

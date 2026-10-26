# Trợ lý thiết kế tour (bản demo)

Công cụ cho nhân viên tư vấn: nhập yêu cầu của khách (nơi khởi hành, các điểm nghỉ đêm, số ngày, ngày đi, chuyến bay, mức vận động), hệ thống gợi ý lịch trình từng ngày. Mỗi lựa chọn đều kèm **lý do** và **minh chứng** lấy từ dữ liệu gốc trên Notion.

## Cấu trúc

```
index.html              Giao diện + bộ máy gợi ý (chạy hoàn toàn trên trình duyệt)
data/
  diem-den.json         1. Điểm đến (nơi nghỉ đêm, số đêm tối thiểu, mùa đẹp, sân bay)
  diem-tham-quan.json   2. Điểm tham quan (độ nổi bật, khung giờ, cụm, giờ mở cửa, mô tả mẫu…)
  chang.json            3. Chặng di chuyển (thời gian, km, giờ bay, điểm ghé dọc đường)
  ngoai-le.json         4. Lịch ngoại lệ (đóng cửa, trùng tu, phương án thay thế)
  khoi-ngay.json        5. Khối ngày (dùng để đối chiếu bữa ăn)
  meta.json             Thời điểm chép dữ liệu từ Notion
```

Dữ liệu được chép từ trang Notion “Hệ thống thiết kế tour tự động – Dữ liệu điểm tham quan Việt Nam”. Mỗi dòng giữ mã trang Notion, nên link “minh chứng” trên giao diện mở đúng dòng gốc (người xem cần quyền truy cập Notion để mở).

## Logic gợi ý (5 bước)

1. **Quỹ thời gian**: số ngày × 3 buổi, trừ giờ bay ngày đầu và ngày cuối.
2. **Thứ tự tuyến và phân bổ đêm**: thử mọi thứ tự ghé các điểm nghỉ đêm, chọn tổng thời gian di chuyển ngắn nhất; đêm dư giao cho điểm xa cổng ra/vào nhất.
3. **Lấp từng buổi**: chỉ xét điểm có khung giờ khớp buổi, còn mở cửa đúng ngày, không vướng lịch ngoại lệ; chọn cụm có tổng độ nổi bật cao nhất rồi gom các điểm cùng cụm.
4. **Điểm ghé dọc đường**: chèn nếu vẫn tới nơi nghỉ trước 18:30.
5. **Xuất văn bản**: ghép từ “Mô tả mẫu”, bữa ăn lấy theo khối ngày trùng điểm nhiều nhất.

Khi Notion còn trống “Thời lượng (phút)” hoặc “Thời gian (phút)”, máy dùng giả định (90 phút/điểm, cận trên của giờ chạy) và hiện cảnh báo trong tab “Cảnh báo dữ liệu”.

## Cập nhật dữ liệu

Thay các file trong `data/` bằng bản chép mới từ Notion rồi commit. GitHub Pages tự cập nhật sau khoảng một phút.

## Chạy trên máy

Trang đọc file JSON bằng `fetch`, nên cần mở qua web server (mở thẳng file `index.html` sẽ không đọc được dữ liệu):

```
python3 -m http.server 8000
```

rồi vào http://localhost:8000.

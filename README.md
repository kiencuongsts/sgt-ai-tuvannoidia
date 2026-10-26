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
  lich-chay.json        8. Lịch chạy dịch vụ (giờ tàu, lên/rời du thuyền, suất diễn, chương trình trên tàu)
  quy-tac.json          7. Quy tắc thiết kế (ví dụ: gom các điểm cùng nhóm vé vào một ngày)
  toa-do.json           Tọa độ địa điểm cho bản đồ (ước tính, chưa có trên Notion)
  meta.json             Thời điểm chép dữ liệu từ Notion
```

## Bản đồ hành trình

Tab “Lịch trình” có bản đồ three.js vẽ đường nối thẳng các điểm theo đúng thứ tự trong lịch máy gợi ý: chọn từng ngày, xem toàn tuyến, vẽ lại, phóng to/thu nhỏ, toàn màn hình. Nền bản đồ lấy từ Natural Earth 1:10m (đã chỉnh để quần đảo Hoàng Sa và Trường Sa thể hiện thuộc Việt Nam).

Tọa độ trong `data/toa-do.json` do Claude ước tính; các dòng `chk: true` cần xác minh. Nên bổ sung cột tọa độ trên Notion để thay thế dần.

Dữ liệu được chép từ trang Notion “Hệ thống thiết kế tour tự động – Dữ liệu điểm tham quan Việt Nam”. Mỗi dòng giữ mã trang Notion, nên link “minh chứng” trên giao diện mở đúng dòng gốc (người xem cần quyền truy cập Notion để mở).

## Quy tắc thiết kế

Bảng “7. Quy tắc thiết kế” trên Notion chứa các quy tắc nhân viên bổ sung dần. Máy tự áp dụng hai loại:

- **Gom cùng ngày**: các điểm cùng “Nhóm vé” (cột mới ở bảng Điểm tham quan) phải nằm trong một ngày, để khách không phải mua vé lần hai. Ngoại lệ khi đêm giữa hai ngày nghỉ tại nơi có “Loại nơi nghỉ” nằm trong cột “Ngoại lệ khi nghỉ đêm tại” (ví dụ “Du thuyền ngủ đêm”). Máy để dành nhóm vé cho ngày quanh đêm ngoại lệ, hoặc cho ngày ở trọn tại nơi có các điểm đó.
- **Không xếp cùng ngày**: các điểm trong nhóm không được nằm chung một ngày.

Mức “Bắt buộc” thì máy loại hẳn; mức “Ưu tiên” thì máy chỉ xếp khi buổi đó không còn điểm nào khác. Loại “Khác (chưa tự động)” chỉ hiển thị trong tab “Quy tắc” để nhân viên tham khảo. Mỗi điểm bị ảnh hưởng đều ghi rõ quy tắc trong phần “Vì sao chọn” hoặc “Điểm chưa xếp”, kèm link tới dòng quy tắc.

## Thử nghiệm với đồng nghiệp

Nút **Đánh giá phương án này** (dưới tóm tắt lịch trình) sao chép tóm tắt phương án: yêu cầu, lịch từng ngày, các chỉnh tay, điểm chưa xếp, cảnh báo. Người thử dán vào bảng “9. Đánh giá thử nghiệm” trên Notion rồi chấm mức phù hợp, tuyến, điểm tham quan, giờ giấc, lý do/minh chứng.

Tự chấm trên 20 tour đang bán (bảng “6. Tour mẫu”), đưa cho máy đúng nơi khởi hành, nơi nghỉ đêm, số ngày, ngày đi, chuyến bay: lịch máy chứa 79% điểm tham quan của tour thật, 12/20 tour có thứ tự nơi nghỉ đêm khớp.

## Chỉnh tay trên lịch

Mỗi điểm tham quan trong tab “Lịch trình” có ba thao tác: **Sửa giờ** (giờ bắt đầu, thời lượng), **Chèn điểm sau** và **Bỏ khỏi lịch**; cuối mỗi ngày có **Chèn điểm vào ngày này**, gợi ý tùy chọn có **Đưa vào lịch**.

- Chỉnh sửa được lưu thành ràng buộc rồi máy chạy lại toàn bộ: mục chỉnh tay giữ đúng giờ đặt, các hoạt động phía sau (bữa ăn, giờ xuất phát, điểm khác, mốc giờ tàu) được tính lại. Điểm máy tự xếp phải xong trước giờ của mục chỉnh tay.
- Điểm bị bỏ không được máy xếp lại; chỗ trống được lấp bằng điểm phù hợp kế tiếp. Có nút “Đưa lại cho máy xếp” trong danh sách điểm chưa xếp.
- Danh sách chèn gồm các điểm chưa có trong lịch tại nơi khách ở trong ngày và dọc đường (kể cả điểm “Tùy chọn” và điểm đã bỏ).
- Máy vẫn xếp theo ý nhân viên nhưng gắn nhãn “Cần xem lại” khi thấy chỗ chưa khớp dữ liệu: ngoài giờ mở cửa, ngày đóng cửa, khác khung giờ phù hợp, vi phạm quy tắc, lệch giờ chạy cố định, hoặc làm trễ giờ tới nơi nghỉ / giờ ra sân bay / giờ tàu.
- Có **Hoàn tác** từng bước và **Bỏ mọi chỉnh sửa**. Chỉnh sửa giữ nguyên khi đổi số đêm, mất khi bấm “Thiết kế lịch trình” với yêu cầu mới, và chưa được lưu lại sau khi tải lại trang.

## Mốc giờ cố định (Lịch chạy dịch vụ)

Bảng “8. Lịch chạy dịch vụ” ghi các dịch vụ có giờ cố định. Mỗi dòng gắn với một **chặng** (tàu, thuyền, xe theo giờ) hoặc một **điểm tham quan** có suất (show, chương trình trên tàu, có thể giới hạn bằng cột “Khi ở tại”).

- **Chặng có giờ chạy:** máy tính ngược từ giờ khởi hành: trừ “Có mặt trước”, “Dự phòng đường” và thời gian đường tới bến, ra giờ phải rời đi. Điểm tham quan trước đó chỉ được xếp trong khung này, ăn trưa dọc đường chỉ khi vẫn kịp, và xe xuất phát theo giờ tính ngược thay vì ra bến quá sớm.
- **Chọn tuyến:** thứ tự tuyến nào làm khách trễ một dịch vụ mức “Cứng” bị loại, máy chuyển sang thứ tự kế tiếp và ghi lý do trong tab “Diễn giải 5 bước”. Nếu không thứ tự nào kịp, lịch vẫn hiện nhưng báo đỏ “Trễ giờ”.
- **Điểm có suất cố định:** chỉ xếp đúng giờ suất; điểm thường phải xong trước suất gần nhất.
- **Khi nghỉ đêm trên du thuyền:** khách theo chương trình của tàu, máy chỉ xếp các hoạt động có trong bảng này cho tàu đó.

Dòng chưa đánh dấu “Đã xác minh” hiện cảnh báo để điều hành kiểm tra với nhà cung cấp.

## Logic gợi ý (5 bước)

1. **Quỹ thời gian**: số ngày × 3 buổi, trừ giờ bay ngày đầu và ngày cuối.
2. **Thứ tự tuyến và phân bổ đêm**: thử mọi thứ tự ghé các điểm nghỉ đêm, chọn tổng thời gian di chuyển ngắn nhất; đêm dư giao cho điểm xa cổng ra/vào nhất.
3. **Lấp từng buổi**: chỉ xét điểm có khung giờ khớp buổi, còn mở cửa đúng ngày, không vướng lịch ngoại lệ; chọn cụm có tổng độ nổi bật cao nhất rồi gom các điểm cùng cụm; áp các quy tắc thiết kế đang bật.
4. **Điểm ghé dọc đường**: chèn nếu vẫn tới nơi nghỉ trước 18:30.
5. **Xuất văn bản**: ghép từ “Mô tả mẫu”, bữa ăn lấy theo khối ngày trùng điểm nhiều nhất.

Khi Notion còn trống “Thời lượng (phút)”, máy dùng thời lượng Claude ước tính theo thời gian tham quan phổ biến (trường `durEst` trong `data/diem-tham-quan.json`, kèm `durTour` = số phút các tour đang bán dành cho điểm đó); không có ước tính thì tính 90 phút. Chặng thiếu “Thời gian (phút)” lấy cận trên của giờ chạy. Cả hai đều hiện cảnh báo trong tab “Cảnh báo dữ liệu”.

Chuyến bay: danh sách liệt kê mọi chuyến theo từng sân bay, mặc định sân bay có nhiều chuyến nhất; chuyến đã chọn quyết định sân bay đến/về của tuyến.

## Cập nhật dữ liệu

Thay các file trong `data/` bằng bản chép mới từ Notion rồi commit. GitHub Pages tự cập nhật sau khoảng một phút.

## Chạy trên máy

Trang đọc file JSON bằng `fetch`, nên cần mở qua web server (mở thẳng file `index.html` sẽ không đọc được dữ liệu):

```
python3 -m http.server 8000
```

rồi vào http://localhost:8000.

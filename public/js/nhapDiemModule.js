// ==========================================
// MODULE NHẬP ĐIỂM (GIẢNG VIÊN / PGV)
// ==========================================
async function renderNhapDiemManager(container) {
    const currentYear = new Date().getFullYear();
    const maxFutureYear = currentYear + 3;
    
    // Xác định năm mặc định theo niên khóa hiện hành
    const now = new Date();
    const currentMonth = now.getMonth();
    const defaultStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;

    let fromYearOptions = '';
    let toYearOptions = '';
    for (let y = 2020; y <= maxFutureYear; y++) {
        fromYearOptions += `<option value="${y}" ${y === defaultStartYear ? 'selected' : ''}>${y}</option>`;
        toYearOptions += `<option value="${y}" ${y === defaultStartYear ? 'selected' : ''}>${y}</option>`;
    }

    let html = `
        <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap: wrap;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Từ năm</label>
                <select id="nd_from_nk" style="width:120px;">${fromYearOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Đến năm</label>
                <select id="nd_to_nk" style="width:120px;">${toYearOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Học kỳ</label>
                <select id="nd_hk" style="width:100px;">
                    <option value="ALL">Tất cả</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="loadNhapDiemClasses()">Danh sách lớp</button>
        </div>
        
        <div class="data-table-container" id="nd_classesContainer" style="margin-bottom: 20px;">
            <p>Vui lòng chọn học kỳ và lấy Danh sách lớp...</p>
        </div>

        <div id="nd_studentsSection" style="display:none;" class="action-panel">
            <div class="panel-header" style="background:#f0f9ff; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <h4 style="margin:0; color:#0369a1;" id="nd_selectedClassTitle">Tiến hành nhập điểm</h4>
                <button class="btn btn-success" onclick="saveAllGrades()" id="nd_saveBtn"><i class="fa-solid fa-floppy-disk"></i> Lưu điểm</button>
            </div>
            <div class="panel-body data-table-container" id="nd_studentsContainer" style="max-height: 500px; overflow-y: auto; padding: 0;">
                <!-- Student list inputs will be here -->
            </div>
        </div>
    `;
    container.innerHTML = html;

    // Tự động load
    setTimeout(loadNhapDiemClasses, 100);
}

window.loadNhapDiemClasses = async () => {
    const fromYear = parseInt(document.getElementById('nd_from_nk').value);
    const toYear = parseInt(document.getElementById('nd_to_nk').value);
    const hkFilter = document.getElementById('nd_hk').value;
    const container = document.getElementById('nd_classesContainer');
    
    if (toYear < fromYear) {
        alert('Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu!');
        container.innerHTML = '<p style="text-align:center; padding:10px; color:red;">Niên khóa lọc không hợp lệ</p>';
        return;
    }

    // Ẩn bảng sinh viên nếu đang mở
    document.getElementById('nd_studentsSection').style.display = 'none';

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    // Nếu là giảng viên (KHOA), chỉ lấy lớp của giảng viên đó
    let magvParam = '';
    if (user.role === 'KHOA') {
        magvParam = `&MAGV=${user.username.trim().toUpperCase()}`;
    }

    container.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const promises = [];
        for (let year = fromYear; year <= toYear; year++) {
            const nk = `${year}-${year+1}`;
            const hks = hkFilter === 'ALL' ? [1, 2, 3] : [parseInt(hkFilter)];
            for (const hkVal of hks) {
                promises.push(
                    fetch(`/api/classes?NIENKHOA=${nk}&HOCKY=${hkVal}${magvParam}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                return data.data;
                            }
                            return [];
                        })
                        .catch(() => [])
                );
            }
        }

        const results = await Promise.all(promises);
        const allClasses = results.flat();

        let html = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead>
                    <tr>
                        <th>Mã LTC</th>
                        <th>Niên Khóa</th>
                        <th>Học Kỳ</th>
                        <th>Mã MH</th>
                        <th>Tên MH</th>
                        <th>Nhóm</th>
                        <th>Giảng Viên</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (allClasses.length > 0) {
            allClasses.forEach(item => {
                const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
                const cleanMamh = item.MAMH ? item.MAMH.trim() : '';
                const cleanTenmh = item.TENMH ? item.TENMH.trim() : '';
                const cleanHotenGv = item.HOTEN_GV ? item.HOTEN_GV.trim() : '';

                // Tính toán trạng thái thời gian thực của lớp
                let statusText = '';
                let isFuture = false;
                if (item.HUYLOP) {
                    statusText = '<span style="color:red">Đã Hủy</span>';
                } else {
                    const parts = cleanNienkhoa.split('-');
                    if (parts.length === 2) {
                        const startYear = parseInt(parts[0]);
                        const endYear = parseInt(parts[1]);
                        const now = new Date();
                        let startDate, endDate;
                        const hkVal = parseInt(item.HOCKY);

                        if (hkVal === 1) {
                            startDate = new Date(startYear, 8, 1, 0, 0, 0, 0); // 1/9
                            endDate = new Date(endYear, 0, 1, 23, 59, 59, 999); // 1/1
                        } else if (hkVal === 2) {
                            startDate = new Date(endYear, 0, 2, 0, 0, 0, 0); // 2/1
                            endDate = new Date(endYear, 6, 7, 23, 59, 59, 999); // 7/7
                        } else {
                            startDate = new Date(endYear, 6, 8, 0, 0, 0, 0); // 8/7
                            endDate = new Date(endYear, 7, 31, 23, 59, 59, 999); // 31/8
                        }

                        if (now < startDate) {
                            statusText = '<span style="color:orange">Chưa mở</span>';
                            isFuture = true;
                        } else if (now >= startDate && now <= endDate) {
                            statusText = '<span style="color:green">Hoạt động</span>';
                        } else {
                            statusText = '<span style="color:gray">Không hoạt động</span>';
                        }
                    } else {
                        statusText = '<span style="color:gray">Không hoạt động</span>';
                    }
                }

                html += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${cleanNienkhoa}</td>
                        <td>Học kỳ ${item.HOCKY}</td>
                        <td>${cleanMamh}</td>
                        <td>${cleanTenmh}</td>
                        <td>${item.NHOM}</td>
                        <td>${cleanHotenGv}</td>
                        <td>${statusText}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-primary" ${item.HUYLOP || isFuture ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} onclick="openGradeForm('${item.MALTC}', '${cleanTenmh}', '${item.NHOM}')">
                                Cập nhật điểm
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="9" style="text-align:center;">Chưa có dữ liệu Lớp tín chỉ cho Học kỳ / Niên khóa này.</td></tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch(err) {
        container.innerHTML = `<p style="color:red;">Lỗi kết nối: ${err.message}</p>`;
    }
};

let currentMALTC = null;

window.openGradeForm = async (maltc, tenmh, nhom) => {
    currentMALTC = maltc;
    document.getElementById('nd_selectedClassTitle').innerHTML = `Lớp: <b>${tenmh}</b> - Nhóm: <b>${nhom}</b> (Mã LTC: ${maltc})`;
    document.getElementById('nd_studentsSection').style.display = 'block';
    const container = document.getElementById('nd_studentsContainer');
    
    container.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> Đang lấy danh sách lớp...</div>';

    try {
        const res = await fetch(`/api/grades/students?MALTC=${maltc}`);
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = `<p style="color:red; padding: 15px;">Lỗi: ${data.message}</p>`;
            return;
        }

        let html = `
            <table class="data-table" id="gradeInputsTable" style="margin: 0; font-size: 0.95rem;">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th>STT</th>
                        <th>Mã SV</th>
                        <th>Họ Tên</th>
                        <th>Lớp</th>
                        <th style="width:100px;">Điểm CC<br><small>(10%)</small></th>
                        <th style="width:100px;">Điểm GK<br><small>(30%)</small></th>
                        <th style="width:100px;">Điểm CK<br><small>(60%)</small></th>
                        <th style="width:100px;">Tổng<br><small>(Hệ 10)</small></th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.data.length > 0) {
            data.data.forEach((st, index) => {
                // Xử lý null value thành chuỗi rỗng
                let cc = st.DIEM_CC !== null ? st.DIEM_CC : '';
                let gk = st.DIEM_GK !== null ? st.DIEM_GK : '';
                let ck = st.DIEM_CK !== null ? st.DIEM_CK : '';
                let tong = st.DIEM_TONG !== null ? st.DIEM_TONG : '-';
                
                html += `
                    <tr class="grade-row" data-masv="${st.MASV}">
                        <td>${index + 1}</td>
                        <td><strong>${st.MASV}</strong></td>
                        <td>${st.HOTEN_SV}</td>
                        <td>${st.MALOP}</td>
                        <td><input type="number" step="0.1" min="0" max="10" class="input-grade cc-grade" value="${cc}" onchange="previewCalc(this)" style="width:60px; padding:3px; text-align:center;"></td>
                        <td><input type="number" step="0.1" min="0" max="10" class="input-grade gk-grade" value="${gk}" onchange="previewCalc(this)" style="width:60px; padding:3px; text-align:center;"></td>
                        <td><input type="number" step="0.1" min="0" max="10" class="input-grade ck-grade" value="${ck}" onchange="previewCalc(this)" style="width:60px; padding:3px; text-align:center;"></td>
                        <td class="tong-grade" style="font-weight:bold; color:#0369a1; text-align:center;">${tong}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="8" style="text-align:center;">Chưa có sinh viên nào đăng ký vào lớp này.</td></tr>`;
        }

        html += `</tbody></table>`;
        container.innerHTML = html;

        // Tự động cuộn trang xuống vùng nhập điểm
        const section = document.getElementById('nd_studentsSection');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (err) {
        container.innerHTML = `<p style="color:red; padding: 15px;">Lỗi kết nối: ${err.message}</p>`;
    }
};

// Auto calc on typing
window.previewCalc = (inputEl) => {
    let row = inputEl.closest('tr');
    let ccVal = row.querySelector('.cc-grade').value.trim();
    let gkVal = row.querySelector('.gk-grade').value.trim();
    let ckVal = row.querySelector('.ck-grade').value.trim();
    
    if (ccVal === '' || gkVal === '' || ckVal === '') {
        row.querySelector('.tong-grade').textContent = '-';
        return;
    }

    let cc = parseFloat(ccVal);
    let gk = parseFloat(gkVal);
    let ck = parseFloat(ckVal);
    
    // Trọng số: 10% CC, 30% GK, 60% CK
    let sum = (cc * 0.1) + (gk * 0.3) + (ck * 0.6);
    row.querySelector('.tong-grade').textContent = sum.toFixed(2);
};

window.saveAllGrades = async () => {
    if (!currentMALTC) return;

    const btn = document.getElementById('nd_saveBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    btn.disabled = true;

    const rows = document.querySelectorAll('.grade-row');
    const gradesPayload = [];

    // Lặp qua tất cả sinh viên để tạo mảng dữ liệu
    for (const row of rows) {
        const masv = row.getAttribute('data-masv');
        const ccVal = row.querySelector('.cc-grade').value;
        const gkVal = row.querySelector('.gk-grade').value;
        const ckVal = row.querySelector('.ck-grade').value;

        gradesPayload.push({
            MASV: masv,
            MALTC: currentMALTC,
            DIEM_CC: ccVal === '' ? null : parseFloat(ccVal),
            DIEM_GK: gkVal === '' ? null : parseFloat(gkVal),
            DIEM_CK: ckVal === '' ? null : parseFloat(ckVal)
        });
    }

    try {
        const res = await fetch('/api/grades/bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gradesPayload)
        });
        
        const result = await res.json();
        
        if (res.ok && result.success) {
            alert('Đã lưu toàn bộ điểm thành công!');
            // Reload lại danh sách sinh viên
            const tenmh = document.getElementById('nd_selectedClassTitle').innerText.split("- Nhóm")[0].replace("Lớp: ", "").trim();
            const nhom = document.getElementById('nd_selectedClassTitle').innerText.split("Nhóm: ")[1].split("(")[0].trim();
            openGradeForm(currentMALTC, tenmh, nhom);
        } else {
            alert('Có lỗi xảy ra: ' + result.message);
        }
    } catch (err) {
        alert('Lỗi kết nối trong quá trình lưu điểm!');
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu điểm';
        btn.disabled = false;
    }
};

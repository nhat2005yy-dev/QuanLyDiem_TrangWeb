// ==========================================
// MODULE NHẬP ĐIỂM (GIẢNG VIÊN / PGV)
// ==========================================
async function renderNhapDiemManager(container) {
    let nk = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
    let hk = 1;

    let html = `
        <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap: wrap;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Niên khóa</label>
                <input type="text" id="nd_nk" value="${nk}" style="width:150px;">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Học kỳ</label>
                <select id="nd_hk" style="width:100px;">
                    <option value="1" ${hk==1?'selected':''}>1</option>
                    <option value="2" ${hk==2?'selected':''}>2</option>
                    <option value="3" ${hk==3?'selected':''}>3</option>
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
    const nk = document.getElementById('nd_nk').value;
    const hk = document.getElementById('nd_hk').value;
    const container = document.getElementById('nd_classesContainer');
    
    // Ẩn bảng sinh viên nếu đang mở
    document.getElementById('nd_studentsSection').style.display = 'none';

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    // Nếu là giảng viên (KHOA), chỉ lấy lớp của giảng viên đó
    let magvParam = '';
    if (user.role === 'KHOA') {
        magvParam = `&MAGV=${user.username}`;
    }

    container.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const res = await fetch(`/api/classes?NIENKHOA=${nk}&HOCKY=${hk}${magvParam}`);
        const data = await res.json();
        
        if (!data.success) {
            container.innerHTML = `<p style="color:red;">Lỗi data: ${data.message}</p>`;
            return;
        }

        let html = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead><tr><th>Mã LTC</th><th>Mã MH</th><th>Tên MH</th><th>Nhóm</th><th>Giảng Viên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
        `;
        
        if (data.data.length > 0) {
            data.data.forEach(item => {
                html += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${item.MAMH}</td>
                        <td>${item.TENMH}</td>
                        <td>${item.NHOM}</td>
                        <td>${item.HOTEN_GV}</td>
                        <td>${item.HUYLOP ? '<span style="color:red">Đã Hủy</span>' : '<span style="color:green">Mở</span>'}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-primary" ${item.HUYLOP ? 'disabled' : ''} onclick="openGradeForm('${item.MALTC}', '${item.TENMH}', '${item.NHOM}')">
                                Cập nhật điểm
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="7" style="text-align:center;">Chưa có dữ liệu Lớp tín chỉ cho Học kỳ / Niên khóa này.</td></tr>`;
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

    } catch (err) {
        container.innerHTML = `<p style="color:red; padding: 15px;">Lỗi kết nối: ${err.message}</p>`;
    }
};

// Auto calc on typing
window.previewCalc = (inputEl) => {
    let row = inputEl.closest('tr');
    let cc = parseFloat(row.querySelector('.cc-grade').value) || 0;
    let gk = parseFloat(row.querySelector('.gk-grade').value) || 0;
    let ck = parseFloat(row.querySelector('.ck-grade').value) || 0;
    
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

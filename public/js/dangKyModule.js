// ==========================================
// MODULE ĐĂNG KÝ LỚP TÍN CHỈ (SINH VIÊN & QUẢN LÝ CHO PGV)
// ==========================================
async function renderDangKyManager(container) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const role = user.role;

    // Tải danh sách Khoa phục vụ bộ lọc khoa cho SV
    let khoaList = [];
    try {
        const khoaRes = await fetch('/api/khoa');
        const khoaData = await khoaRes.json();
        if (khoaData.success) khoaList = khoaData.data;
    } catch (e) {}

    let khoaOptions = '<option value="ALL">Tất cả khoa</option>';
    khoaList.forEach(k => {
        khoaOptions += `<option value="${k.MAKHOA.trim()}">${k.MAKHOA.trim()} - ${k.TENKHOA.trim()}</option>`;
    });

    if (role === 'PGV' || role === 'KHOA') {
        // Tải danh sách giảng viên trước khi render
        let gvList = [];
        try {
            const res = await fetch('/api/giangvien');
            const resJson = await res.json();
            if (resJson.success) {
                gvList = resJson.data;
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách giảng viên:', err);
        }

        let gvOptions = '<option value="ALL">Tất cả giảng viên</option>';
        gvList.forEach(gv => {
            const cleanMagv = gv.MAGV.trim();
            const cleanTen = `${gv.HO.trim()} ${gv.TEN.trim()}`;
            gvOptions += `<option value="${cleanMagv}">${cleanMagv} - ${cleanTen}</option>`;
        });

        // Render giao diện quản lý đăng ký dành cho PGV/KHOA
        const currentYear = new Date().getFullYear();
        let fromYearOptions = '';
        let toYearOptions = '';
        for (let y = 2020; y <= currentYear + 4; y++) {
            fromYearOptions += `<option value="${y}" ${y === currentYear - 1 ? 'selected' : ''}>${y}</option>`;
            toYearOptions += `<option value="${y}" ${y === currentYear + 1 ? 'selected' : ''}>${y}</option>`;
        }

        let html = `
            <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap: wrap;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Từ năm</label>
                    <select id="dk_from_year" style="width:120px;">${fromYearOptions}</select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Đến năm</label>
                    <select id="dk_to_year" style="width:120px;">${toYearOptions}</select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Học kỳ</label>
                    <select id="dk_hk" style="width:100px;">
                        <option value="ALL">Tất cả</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Giảng viên</label>
                    <select id="dk_magv" style="width:220px;">${gvOptions}</select>
                </div>
                <button class="btn btn-primary" onclick="loadManagerRegistrationData()">Tra cứu</button>
            </div>
            
            <div class="action-panel" style="margin-top: 0;">
                <div class="panel-header" style="background:#f8fafc; padding:10px 15px;">
                    <h4 style="margin:0; color:#0f172a;"><i class="fa-solid fa-list-ul"></i> Danh sách Lớp tín chỉ & Đăng ký</h4>
                </div>
                <div class="panel-body data-table-container" id="dk_managerTableContainer">
                    <p style="text-align:center; padding:10px;">Vui lòng ấn Tra cứu...</p>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Nếu là role KHOA, tự động chọn mã GV hiện hành và khóa cứng
        if (role === 'KHOA') {
            const selectEl = document.getElementById('dk_magv');
            if (selectEl) {
                selectEl.value = user.username.trim().toUpperCase();
                selectEl.disabled = true;
            }
        }

        setTimeout(loadManagerRegistrationData, 100);
    } else {
        // Giao diện Đăng ký lớp tín chỉ dành cho Sinh Viên
        const currentYear = new Date().getFullYear();
        const maxFutureYear = currentYear + 3;
        let fromYearOptions = '';
        let toYearOptions = '';
        for (let y = 2020; y <= maxFutureYear; y++) {
            fromYearOptions += `<option value="${y}" ${y === 2020 ? 'selected' : ''}>${y}</option>`;
            toYearOptions += `<option value="${y}" ${y === maxFutureYear ? 'selected' : ''}>${y}</option>`;
        }
        let hk = 'ALL';

        let html = `
            <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap: wrap;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Từ năm</label>
                    <select id="dk_student_from_year" onchange="loadDangKyData()" style="width:120px;">
                        ${fromYearOptions}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Đến năm</label>
                    <select id="dk_student_to_year" onchange="loadDangKyData()" style="width:120px;">
                        ${toYearOptions}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Học kỳ</label>
                    <select id="dk_hk" onchange="loadDangKyData()" style="width:100px;">
                        <option value="ALL" ${hk==='ALL'?'selected':''}>Tất cả</option>
                        <option value="1" ${hk==1?'selected':''}>1</option>
                        <option value="2" ${hk==2?'selected':''}>2</option>
                        <option value="3" ${hk==3?'selected':''}>3</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Khoa</label>
                    <select id="dk_student_khoa" onchange="loadDangKyData()" style="width:180px;">
                        ${khoaOptions}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Trạng thái</label>
                    <select id="dk_student_status" onchange="loadDangKyData()" style="width:140px;">
                        <option value="ALL" selected>Tất cả</option>
                        <option value="ACTIVE">Đang mở</option>
                        <option value="FUTURE">Chưa mở</option>
                        <option value="PAST">Hết hạn ĐK</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="loadDangKyData()">Tra cứu Lớp</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                <!-- Phần danh sách lớp đang mở -->
                <div class="action-panel" style="margin-top: 0;">
                    <div class="panel-header" style="background:#f8fafc; padding:10px 15px;">
                        <h4 style="margin:0; color:#0f172a;"><i class="fa-solid fa-list-ul"></i> Lớp tín chỉ đang mở</h4>
                    </div>
                    <div class="panel-body data-table-container" id="dk_availableClasses" style="max-height: 300px; overflow-y: auto;">
                        <p style="text-align:center; padding:10px;">Vui lòng ấn Tra cứu...</p>
                    </div>
                </div>

                <!-- Phần danh sách lớp đã đăng ký -->
                <div class="action-panel" style="margin-top: 0;">
                    <div class="panel-header" style="background:#f0fdf4; padding:10px 15px;">
                        <h4 style="margin:0; color:#166534;"><i class="fa-regular fa-circle-check"></i> Kết quả Đăng ký môn học</h4>
                    </div>
                    <div class="panel-body data-table-container" id="dk_registeredClasses" style="max-height: 300px; overflow-y: auto;">
                        <p style="text-align:center; padding:10px;">Vui lòng ấn Tra cứu...</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        setTimeout(loadDangKyData, 100);
    }
}

// --- LOGIC DÀNH CHO PGV / QUẢN LÝ ---
window.loadManagerRegistrationData = async () => {
    const fromYear = parseInt(document.getElementById('dk_from_year').value);
    const toYear = parseInt(document.getElementById('dk_to_year').value);
    const hkFilter = document.getElementById('dk_hk').value;
    const container = document.getElementById('dk_managerTableContainer');

    const magvSelect = document.getElementById('dk_magv');
    const magvFilter = magvSelect ? magvSelect.value : 'ALL';

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let magvVal = magvFilter;
    if (user && user.role === 'KHOA') {
        magvVal = user.username.trim().toUpperCase();
    }

    let magvParam = '';
    if (magvVal !== 'ALL') {
        magvParam = `&MAGV=${magvVal}`;
    }

    if (toYear < fromYear) {
        alert('Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu!');
        container.innerHTML = '<p style="text-align:center; padding:10px; color:red;">Niên khóa lọc không hợp lệ</p>';
        return;
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
                                return data.data.map(item => ({ ...item, nienkhoa: nk, hocky: hkVal }));
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
                        <th>Môn Học</th>
                        <th>Nhóm</th>
                        <th>Giảng Viên</th>
                        <th>Trạng Thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (allClasses.length > 0) {
            allClasses.forEach(item => {
                const rawNienkhoa = item.nienkhoa || item.NIENKHOA;
                const cleanNienkhoa = rawNienkhoa ? rawNienkhoa.trim() : '';
                const cleanTenmh = item.TENMH ? item.TENMH.trim() : '';
                const cleanMamh = item.MAMH ? item.MAMH.trim() : '';
                let statusSpan = '';
                if (item.HUYLOP) {
                    statusSpan = '<span style="color:red">Đã Hủy</span>';
                } else {
                    const parts = cleanNienkhoa.split('-');
                    if (parts.length === 2) {
                        const startYear = parseInt(parts[0]);
                        const endYear = parseInt(parts[1]);
                        const now = new Date();
                        let startDate, endDate;
                        const hkVal = parseInt(item.hocky || item.HOCKY);

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
                            statusSpan = '<span style="color:orange">Chưa mở</span>';
                        } else if (now >= startDate && now <= endDate) {
                            statusSpan = '<span style="color:green">Hoạt động</span>';
                        } else {
                            statusSpan = '<span style="color:red">Không hoạt động</span>';
                        }
                    } else {
                        statusSpan = '<span style="color:red">Không hoạt động</span>';
                    }
                }
                
                html += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${cleanNienkhoa}</td>
                        <td>Học kỳ ${item.hocky}</td>
                        <td>${cleanMamh} - ${cleanTenmh}</td>
                        <td>${item.NHOM}</td>
                        <td>${item.HOTEN_GV ? item.HOTEN_GV.trim() : ''}</td>
                        <td>${statusSpan}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-primary" onclick="showRegistrationDetails('${item.MALTC}', '${cleanMamh} - ${cleanTenmh}', '${cleanNienkhoa}', ${item.hocky})">Chi tiết</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="8" style="text-align:center;">Không tìm thấy lớp tín chỉ nào trong phạm vi thời gian này</td></tr>`;
        }

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`;
    }
};

window.showRegistrationDetails = async (maltc, subjectName, nienkhoa, hocky) => {
    openModal('Đang tải...', '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>');
    
    try {
        const res = await fetch(`/api/grades/students?MALTC=${maltc}`);
        const data = await res.json();
        
        let studentsHtml = '';
        if (data.success && data.data.length > 0) {
            studentsHtml += `
                <div style="margin-bottom: 15px; font-size: 0.95rem; line-height: 1.6;">
                    <p><strong>Môn học:</strong> ${subjectName}</p>
                    <p><strong>Niên khóa:</strong> ${nienkhoa} &nbsp;|&nbsp; <strong>Học kỳ:</strong> ${hocky}</p>
                    <p><strong>Tổng số sinh viên đăng ký:</strong> <span style="font-weight:bold; color:#1e3a8a;">${data.data.length}</span></p>
                </div>
                <div class="data-table-container" style="max-height: 350px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <table class="data-table" style="font-size:0.9rem; margin-bottom:0;">
                        <thead>
                            <tr style="position: sticky; top:0; background:#f1f5f9; z-index:1;">
                                <th>Mã SV</th>
                                <th>Họ Tên</th>
                                <th>Lớp Hành Chính</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            data.data.forEach(sv => {
                studentsHtml += `
                    <tr>
                        <td><strong>${sv.MASV.trim()}</strong></td>
                        <td>${sv.HOTEN_SV ? sv.HOTEN_SV.trim() : ''}</td>
                        <td>${sv.MALOP ? sv.MALOP.trim() : ''}</td>
                    </tr>
                `;
            });
            studentsHtml += '</tbody></table></div>';
        } else {
            studentsHtml = `
                <div style="margin-bottom: 15px; font-size: 0.95rem;">
                    <p><strong>Môn học:</strong> ${subjectName}</p>
                    <p><strong>Niên khóa:</strong> ${nienkhoa} &nbsp;|&nbsp; <strong>Học kỳ:</strong> ${hocky}</p>
                </div>
                <div style="text-align:center; padding: 30px; background:#fef2f2; border-radius:8px; border: 1px solid #fee2e2; margin: 10px 0;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:#ef4444; margin-bottom:10px;"></i>
                    <p style="font-weight: bold; color: #b91c1c; margin:0;">Chưa có sinh viên nào đăng ký lớp tín chỉ này</p>
                </div>
            `;
        }
        
        studentsHtml += `
            <div class="form-actions" style="margin-top: 20px; display:flex; justify-content:flex-end;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Đóng</button>
            </div>
        `;
        
        openModal(`Chi tiết Sinh viên đăng ký - Lớp TC #${maltc}`, studentsHtml);
        
    } catch (err) {
        openModal('Lỗi', `<p style="color:red; padding:20px;">Không thể tải chi tiết đăng ký: ${err.message}</p>`);
    }
};

// --- LOGIC DÀNH CHO SINH VIÊN ---
window.loadDangKyData = async () => {
    const fromYearSelect = document.getElementById('dk_student_from_year');
    const toYearSelect = document.getElementById('dk_student_to_year');
    if (!fromYearSelect || !toYearSelect) return;

    const fromYear = parseInt(fromYearSelect.value);
    const toYear = parseInt(toYearSelect.value);
    const hk = document.getElementById('dk_hk').value;
    const dkKhoaSelect = document.getElementById('dk_student_khoa');
    const dkKhoaFilter = dkKhoaSelect ? dkKhoaSelect.value : 'ALL';

    if (toYear < fromYear) {
        alert('Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu!');
        document.getElementById('dk_availableClasses').innerHTML = '<p style="text-align:center; padding:10px; color:red;">Khoảng năm không hợp lệ</p>';
        document.getElementById('dk_registeredClasses').innerHTML = '<p style="text-align:center; padding:10px; color:red;">Khoảng năm không hợp lệ</p>';
        return;
    }
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const masv = user.username;

    const availableContainer = document.getElementById('dk_availableClasses');
    const registeredContainer = document.getElementById('dk_registeredClasses');

    availableContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';
    registeredContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const classPromises = [];
        const regPromises = [];
        const hks = hk === 'ALL' ? [1, 2, 3] : [parseInt(hk)];
        for (let year = fromYear; year <= toYear; year++) {
            const nkVal = `${year}-${year+1}`;
            for (const hkVal of hks) {
                classPromises.push(
                    fetch(`/api/classes?NIENKHOA=${nkVal}&HOCKY=${hkVal}`)
                        .then(res => res.json())
                        .then(data => data.success ? data.data : [])
                        .catch(() => [])
                );
                regPromises.push(
                    fetch(`/api/course-registration?MASV=${masv}&NIENKHOA=${nkVal}&HOCKY=${hkVal}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                return data.data.map(item => ({ ...item, NIENKHOA: nkVal, HOCKY: hkVal }));
                            }
                            return [];
                        })
                        .catch(() => [])
                );
            }
        }

        const [classResults, regResults] = await Promise.all([
            Promise.all(classPromises),
            Promise.all(regPromises)
        ]);

        const allClasses = classResults.flat();
        const allRegistered = regResults.flat();

        // 1. Render Các Lớp Đã Đăng Ký
        let regHtml = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead>
                    <tr>
                        <th>Mã LTC</th>
                        <th>Niên khóa</th>
                        <th>Học kỳ</th>
                        <th>Mã MH</th>
                        <th>Tên MH</th>
                        <th>Nhóm</th>
                        <th>Giảng Viên</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;
        let registeredMaltcSet = new Set();
        if (allRegistered.length > 0) {
            allRegistered.forEach(item => {
                registeredMaltcSet.add(item.MALTC);
                const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
                regHtml += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${cleanNienkhoa}</td>
                        <td>Học kỳ ${item.HOCKY}</td>
                        <td>${item.MAMH ? item.MAMH.trim() : ''}</td>
                        <td>${item.TENMH ? item.TENMH.trim() : ''}</td>
                        <td>${item.NHOM}</td>
                        <td>${item.HOTEN_GV ? item.HOTEN_GV.trim() : ''}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-danger" onclick="cancelRegistration('${masv}', '${item.MALTC}')">Hủy đăng ký</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            regHtml += `<tr><td colspan="8" style="text-align:center;">Bạn chưa đăng ký môn nào trong khoảng thời gian này</td></tr>`;
        }
        regHtml += `</tbody></table>`;
        registeredContainer.innerHTML = regHtml;

        // 2. Render Các Lớp Đang Mở (bỏ đi các lớp đã đăng ký)
        let availHtml = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead>
                    <tr>
                        <th>Mã LTC</th>
                        <th>Niên Khóa</th>
                        <th>Học kỳ</th>
                        <th>Mã MH</th>
                        <th>Tên MH</th>
                        <th>Nhóm</th>
                        <th>Giảng Viên</th>
                        <th>Sĩ Số (ĐK/Min)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (allClasses.length > 0) {
            let hasOpenClass = false;
            let classesToRender = allClasses;
            if (dkKhoaFilter !== 'ALL') {
                classesToRender = classesToRender.filter(item => (item.MAKHOA ? item.MAKHOA.trim() : '') === dkKhoaFilter);
            }

            const dkStatusFilterSelect = document.getElementById('dk_student_status');
            const dkStatusFilter = dkStatusFilterSelect ? dkStatusFilterSelect.value : 'ALL';
            if (dkStatusFilter !== 'ALL') {
                classesToRender = classesToRender.filter(item => {
                    const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
                    const parts = cleanNienkhoa.split('-');
                    let status = 'PAST';
                    if (parts.length === 2) {
                        const startYear = parseInt(parts[0]);
                        const endYear = parseInt(parts[1]);
                        const now = new Date();
                        let startDate, endDate;
                        const hkVal = parseInt(item.HOCKY);
                        if (hkVal === 1) {
                            startDate = new Date(startYear, 8, 1, 0, 0, 0, 0);
                            endDate = new Date(endYear, 0, 1, 23, 59, 59, 999);
                        } else if (hkVal === 2) {
                            startDate = new Date(endYear, 0, 2, 0, 0, 0, 0);
                            endDate = new Date(endYear, 6, 7, 23, 59, 59, 999);
                        } else {
                            startDate = new Date(endYear, 6, 8, 0, 0, 0, 0);
                            endDate = new Date(endYear, 7, 31, 23, 59, 59, 999);
                        }
                        if (now >= startDate && now <= endDate) {
                            status = 'ACTIVE';
                        } else if (now < startDate) {
                            status = 'FUTURE';
                        }
                    }
                    return status === dkStatusFilter;
                });
            }

            classesToRender.forEach(item => {
                // Nếu lớp chưa bị hủy và sinh viên chưa đăng ký vào lớp đó
                if (!item.HUYLOP && !registeredMaltcSet.has(item.MALTC)) {
                    hasOpenClass = true;
                    
                    const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
                    const parts = cleanNienkhoa.split('-');
                    let isActive = false;
                    let isFuture = false;
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
                        isActive = (now >= startDate && now <= endDate);
                        isFuture = (now < startDate);
                    }

                    const enrolledCount = item.SOSVDANGKY !== undefined ? item.SOSVDANGKY : 0;

                    availHtml += `
                        <tr>
                            <td><strong>${item.MALTC}</strong></td>
                            <td>${cleanNienkhoa}</td>
                            <td>Học kỳ ${item.HOCKY}</td>
                            <td>${item.MAMH ? item.MAMH.trim() : ''}</td>
                            <td>${item.TENMH ? item.TENMH.trim() : ''}</td>
                            <td>${item.NHOM}</td>
                            <td>${item.HOTEN_GV ? item.HOTEN_GV.trim() : ''}</td>
                            <td><strong>${enrolledCount}</strong>/${item.SOSVTOITHIEU}</td>
                            <td class="action-btns">
                                ${isActive ? 
                                    `<button class="btn-sm btn-primary" onclick="submitRegistration('${masv}', '${item.MALTC}')">Đăng ký</button>` : 
                                    (isFuture ? 
                                        `<button class="btn-sm btn-secondary" disabled style="opacity:0.6; cursor:not-allowed;" title="Lớp tín chỉ chưa mở thời gian đăng ký">Chưa mở</button>` : 
                                        `<button class="btn-sm btn-secondary" disabled style="opacity:0.6; cursor:not-allowed;" title="Lớp tín chỉ đã hết hạn thời gian đăng ký">Hết hạn ĐK</button>`
                                    )
                                }
                            </td>
                        </tr>
                    `;
                }
            });
            if (!hasOpenClass) {
                availHtml += `<tr><td colspan="9" style="text-align:center;">Không có lớp tín chỉ nào khả dụng để đăng ký thêm</td></tr>`;
            }
        } else {
            availHtml += `<tr><td colspan="9" style="text-align:center;">Khoảng thời gian này chưa mở lớp tín chỉ nào</td></tr>`;
        }
        availHtml += `</tbody></table>`;
        availableContainer.innerHTML = availHtml;

    } catch (err) {
        availableContainer.innerHTML = `<p style="color:red;">Lỗi kết nối: ${err.message}</p>`;
        registeredContainer.innerHTML = `<p style="color:red;">Lỗi kết nối: ${err.message}</p>`;
    }
};

window.submitRegistration = async (masv, maltc) => {
    try {
        const res = await fetch('/api/course-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MASV: masv, MALTC: maltc })
        });
        const result = await res.json();
        if (res.ok) {
            loadDangKyData(); // reload
        } else {
            alert('Lỗi đăng ký: ' + result.message);
        }
    } catch(err) {
        alert('Lỗi hệ thống');
    }
};

window.cancelRegistration = async (masv, maltc) => {
    if(!confirm(`Bạn thực sự muốn HỦY đăng ký lớp tín chỉ ${maltc}?`)) return;
    try {
        const res = await fetch(`/api/course-registration?MASV=${masv}&MALTC=${maltc}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        if (res.ok) {
            loadDangKyData(); // reload
        } else {
            alert('Lỗi hủy đăng ký: ' + result.message);
        }
    } catch(err) {
        alert('Lỗi hệ thống');
    }
};

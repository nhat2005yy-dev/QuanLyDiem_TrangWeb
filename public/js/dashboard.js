document.addEventListener('DOMContentLoaded', () => {
    // 0. Gắn tự động JWT token vào toàn bộ các Request Fetch đến Backend API
    const _originalFetch = window.fetch;
    window.fetch = function() {
        let [resource, config] = arguments;
        if (typeof resource === 'string' && (resource.startsWith('/api') || resource.startsWith('/register-internal'))) {
            config = config || {};
            config.headers = config.headers || {};
            const token = localStorage.getItem('token');
            if (token && !config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return _originalFetch(resource, config);
        }
        return _originalFetch.apply(this, arguments);
    };

    // 1. Kiểm tra xác thực (Check Auth)
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }

    const user = JSON.parse(userStr);
    const role = user.role.toUpperCase();

    // 2. Cập nhật thông tin UI
    document.getElementById('displayUsername').textContent = user.username;
    let roleName = "Sinh Viên";
    if (role === 'PGV') roleName = "Phòng Giáo Vụ";
    else if (role === 'KHOA') roleName = "Giảng Viên / Khoa";
    document.getElementById('displayRole').textContent = roleName;

    // Thiết lập lời chào động
    if (role === 'KHOA') {
        document.getElementById('welcomeTitle').textContent = "Đang tải...";
        fetch('/api/giangvien')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const lecturer = data.data.find(g => g.MAGV.trim().toUpperCase() === user.username.trim().toUpperCase());
                    if (lecturer) {
                        const name = `${lecturer.HO.trim()} ${lecturer.TEN.trim()}`;
                        document.getElementById('welcomeTitle').textContent = `Chào giảng viên ${name}`;
                        document.getElementById('displayUsername').textContent = name;
                        
                        // Cập nhật avatar theo tên thật giảng viên
                        const colors = ['4f46e5', '0ea5e9', '10b981', 'f59e0b', 'ef4444'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        document.getElementById('avatarImg').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff`;
                    } else {
                        document.getElementById('welcomeTitle').textContent = `Chào giảng viên ${user.username.toUpperCase()}`;
                        document.getElementById('displayUsername').textContent = user.username.toUpperCase();
                    }
                } else {
                    document.getElementById('welcomeTitle').textContent = `Chào giảng viên ${user.username.toUpperCase()}`;
                    document.getElementById('displayUsername').textContent = user.username.toUpperCase();
                }
            })
            .catch(() => {
                document.getElementById('welcomeTitle').textContent = `Chào giảng viên ${user.username.toUpperCase()}`;
                document.getElementById('displayUsername').textContent = user.username.toUpperCase();
            });
    } else {
        document.getElementById('welcomeTitle').textContent = `Xin chào, ${user.username}!`;
    }

    // Tính toán và hiển thị học kỳ hiện tại theo mốc thời gian thực tế
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const currentDayVal = (currentMonth + 1) * 100 + currentDate;

    let semesterText = '';
    let startYear = currentYear;
    let endYear = currentYear + 1;

    if (currentDayVal >= 901 || currentDayVal <= 101) {
        semesterText = 'Kỳ 1';
        startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
        endYear = startYear + 1;
    } else if (currentDayVal >= 102 && currentDayVal <= 707) {
        semesterText = 'Kỳ 2';
        startYear = currentYear - 1;
        endYear = currentYear;
    } else {
        semesterText = 'Kỳ 3';
        startYear = currentYear - 1;
        endYear = currentYear;
    }

    document.getElementById('displayCurrentSemester').textContent = `${semesterText} - ${startYear}-${endYear}`;

    const colors = ['4f46e5', '0ea5e9', '10b981', 'f59e0b', 'ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('avatarImg').src = `https://ui-avatars.com/api/?name=${user.username}&background=${randomColor}&color=fff`;

    // 3. Phân quyền Hiển thị Menu (RBAC)
    const menuConfig = {
        'PGV': ['header-quanly', 'menu-khoa', 'menu-lop', 'menu-monhoc', 'menu-giangvien', 'menu-sinhvien', 'header-hoctap', 'menu-loptc', 'menu-dangky', 'menu-nhapdiem', 'header-hethong', 'menu-taotk'],
        'KHOA': ['header-quanly', 'menu-khoa', 'menu-giangvien', 'header-hoctap', 'menu-dangky', 'menu-nhapdiem', 'header-hethong', 'menu-taotk'],
        'SINHVIEN': ['header-hoctap', 'menu-dangky', 'menu-diem']
    };
    const allowedElements = menuConfig[role] || menuConfig['SINHVIEN'];
    allowedElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });

    // Cập nhật nhãn Menu Đăng ký cho PGV/KHOA thành Quản lý Đăng ký
    const menuDangKy = document.getElementById('menu-dangky');
    if (menuDangKy && (role === 'PGV' || role === 'KHOA')) {
        const span = menuDangKy.querySelector('span');
        if (span) span.textContent = 'Quản lý Đăng ký';
    }

    // 4. Các nút thao tác chung
    document.getElementById('toggleSidebar').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('active'));
    document.getElementById('closeSidebar').addEventListener('click', () => document.getElementById('sidebar').classList.remove('active'));
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);

    // 5. Xử lý click Menu chuyển trang
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const text = this.querySelector('span').textContent;
            document.getElementById('panelTitle').textContent = text;
            document.getElementById('breadcrumb').textContent = text;
            if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');

            // Dispatch route handler
            const menuId = this.id;
            const contentDiv = document.getElementById('panelContent');
            contentDiv.innerHTML = '<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Đang tải dữ liệu...</p></div>';

            if (menuId === 'menu-khoa') return renderKhoaManager(contentDiv);
            if (menuId === 'menu-lop') return renderLopManager(contentDiv);
            if (menuId === 'menu-monhoc') return renderMonHocManager(contentDiv);
            if (menuId === 'menu-giangvien') return renderGiangVienManager(contentDiv);
            if (menuId === 'menu-sinhvien') return renderSinhVienManager(contentDiv);
            if (menuId === 'menu-loptc') return renderLopTinChiManager(contentDiv);
            if (menuId === 'menu-dangky') return renderDangKyManager(contentDiv);
            if (menuId === 'menu-nhapdiem') return renderNhapDiemManager(contentDiv);
            if (menuId === 'menu-taotk') return renderTaoTaiKhoanManager(contentDiv);
            if (menuId === 'menu-diem') return renderDiemManager(contentDiv);
            
            // Default placeholder
            contentDiv.innerHTML = `<div class="empty-state"><i class="fa-regular fa-compass empty-icon"></i><p>Chức năng <strong>${text}</strong> đang được phát triển.</p></div>`;
        });
    });
});

// --- HELPER QUẢN LÝ MODAL ---
function openModal(title, contentHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = contentHTML;
    document.getElementById('globalModal').classList.add('active');
}

function closeModal() {
    document.getElementById('globalModal').classList.remove('active');
}

// ==========================================
// 1. MODULE QUẢN LÝ KHOA
// ==========================================
async function renderKhoaManager(container) {
    try {
        const res = await fetch('/api/khoa');
        const data = await res.json();
        
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isReadOnly = user && user.role === 'KHOA';

        let html = '';
        if (!isReadOnly) {
            html += `
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="showKhoaForm()"><i class="fa-solid fa-plus"></i> Thêm Khoa Mới</button>
                </div>
            `;
        }

        html += `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã Khoa</th><th>Tên Khoa</th>${isReadOnly ? '' : '<th>Thao tác</th>'}</tr></thead>
                    <tbody>
        `;
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
                const cleanMaKhoa = item.MAKHOA.trim();
                const cleanTenKhoa = item.TENKHOA.trim();
                html += `
                    <tr>
                        <td><strong>${cleanMaKhoa}</strong></td>
                        <td>${cleanTenKhoa}</td>
                        ${isReadOnly ? '' : `
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showKhoaForm('${cleanMaKhoa}', '${cleanTenKhoa}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteKhoa('${cleanMaKhoa}')">Xóa</button>
                        </td>
                        `}
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="${isReadOnly ? 2 : 3}" style="text-align:center;">Chưa có dữ liệu Khoa</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`;
    }
}

window.showKhoaForm = (makhoa = '', tenkhoa = '') => {
    const cleanMakhoa = makhoa.trim().toUpperCase();
    const cleanTenkhoa = tenkhoa.trim();
    const isEdit = !!cleanMakhoa;
    const formHTML = `
        <form id="khoaForm">
            <div class="form-group">
                <label>Mã Khoa</label>
                <input type="text" id="k_makhoa" value="${cleanMakhoa}" maxlength="10" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'} oninput="this.value = this.value.toUpperCase().replace(/\\s/g, '')">
            </div>
            <div class="form-group">
                <label>Tên Khoa</label>
                <input type="text" id="k_tenkhoa" value="${cleanTenkhoa}" maxlength="50" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Sửa thông tin Khoa' : 'Thêm Khoa Mới', formHTML);

    document.getElementById('khoaForm').onsubmit = async (e) => {
        e.preventDefault();
        const rawMaKhoa = document.getElementById('k_makhoa').value.toUpperCase().trim().replace(/\s/g, '');
        const rawTenKhoa = document.getElementById('k_tenkhoa').value.trim();

        if (!rawMaKhoa || !rawTenKhoa) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const bodyData = {
            MAKHOA: rawMaKhoa,
            TENKHOA: rawTenKhoa
        };
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/khoa/${bodyData.MAKHOA}` : `/api/khoa`;

        try {
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData)
            });
            const result = await res.json();
            if (result.success) {
                closeModal();
                renderKhoaManager(document.getElementById('panelContent'));
            } else {
                alert(result.message);
            }
        } catch (err) { alert('Lỗi kết nối'); }
    };
};

window.deleteKhoa = async (makhoa) => {
    const cleanMakhoa = makhoa.trim();
    if(!confirm(`Bạn có chắc muốn xóa Khoa ${cleanMakhoa}?`)) return;
    try {
        const res = await fetch(`/api/khoa/${cleanMakhoa}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderKhoaManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

// ==========================================
// 2. MODULE QUẢN LÝ LỚP
// ==========================================
async function renderLopManager(container) {
    try {
        const res = await fetch('/api/lop');
        const data = await res.json();
        
        // Tải danh sách Khoa phục vụ bộ lọc
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

        window.currentLopList = data.success ? data.data : [];

        let html = `
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="showLopForm()"><i class="fa-solid fa-plus"></i> Thêm Lớp Mới</button>
                <div class="form-group" style="margin-bottom: 0; display: flex; gap: 8px; align-items: center;">
                    <label style="margin-bottom: 0; white-space: nowrap; font-weight: 500;">Khoa:</label>
                    <select id="filter_class_khoa" onchange="filterLopByKhoa()" style="width: 180px; padding: 6px 12px; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; background: #fff;">
                        ${khoaOptions}
                    </select>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã Lớp</th><th>Tên Lớp</th><th>Khóa Học</th><th>Mã Khoa</th><th>Thao tác</th></tr></thead>
                    <tbody id="classTableBody">
        `;
        
        if (window.currentLopList.length > 0) {
            window.currentLopList.forEach(item => {
                const cleanMakhoa = item.MAKHOA ? item.MAKHOA.trim() : '';
                html += `
                    <tr>
                        <td><strong>${item.MALOP}</strong></td>
                        <td>${item.TENLOP}</td>
                        <td>${item.KHOAHOC}</td>
                        <td>${cleanMakhoa}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showLopForm('${item.MALOP}', '${item.TENLOP}', '${item.KHOAHOC}', '${cleanMakhoa}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteLop('${item.MALOP}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="5" style="text-align:center;">Chưa có dữ liệu Lớp</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) { container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`; }
}

window.filterLopByKhoa = () => {
    const selectedKhoa = document.getElementById('filter_class_khoa').value;
    const tbody = document.getElementById('classTableBody');
    if (!tbody) return;

    let filtered = window.currentLopList || [];
    if (selectedKhoa !== 'ALL') {
        filtered = filtered.filter(item => {
            const itemKhoa = item.MAKHOA ? item.MAKHOA.trim() : '';
            return itemKhoa === selectedKhoa;
        });
    }

    let html = '';
    if (filtered.length > 0) {
        filtered.forEach(item => {
            const cleanMakhoa = item.MAKHOA ? item.MAKHOA.trim() : '';
            html += `
                <tr>
                    <td><strong>${item.MALOP}</strong></td>
                    <td>${item.TENLOP}</td>
                    <td>${item.KHOAHOC}</td>
                    <td>${cleanMakhoa}</td>
                    <td class="action-btns">
                        <button class="btn-sm btn-secondary" onclick="showLopForm('${item.MALOP}', '${item.TENLOP}', '${item.KHOAHOC}', '${cleanMakhoa}')">Sửa</button>
                        <button class="btn-sm btn-danger" onclick="deleteLop('${item.MALOP}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="5" style="text-align:center;">Không tìm thấy Lớp nào thuộc Khoa này</td></tr>`;
    }
    tbody.innerHTML = html;
};

window.showLopForm = async (malop = '', tenlop = '', khoahoc = '', makhoa = '') => {
    const isEdit = !!malop;
    
    // Fetch khoa list for dropdown
    let khoaOptions = '<option value="">-- Chọn Khoa --</option>';
    try {
        const khoaRes = await fetch('/api/khoa');
        const khoaData = await khoaRes.json();
        if(khoaData.success) {
            khoaData.data.forEach(k => {
                const cleanKMa = k.MAKHOA.trim();
                const cleanInputMa = makhoa.trim();
                khoaOptions += `<option value="${cleanKMa}" ${cleanInputMa === cleanKMa ? 'selected' : ''}>${k.TENKHOA.trim()}</option>`;
            });
        }
    } catch(e) {}

    const formHTML = `
        <form id="lopForm">
            <div class="form-group">
                <label>Mã Lớp</label>
                <input type="text" id="l_malop" value="${malop}" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'}>
            </div>
            <div class="form-group">
                <label>Tên Lớp</label>
                <input type="text" id="l_tenlop" value="${tenlop}" required>
            </div>
            <div class="form-group">
                <label>Khóa Học</label>
                <input type="text" id="l_khoahoc" value="${khoahoc}" required placeholder="VD: 2021-2025">
            </div>
            <div class="form-group">
                <label>Thuộc Khoa</label>
                <select id="l_makhoa" required>${khoaOptions}</select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Sửa thông tin Lớp' : 'Thêm Lớp Mới', formHTML);

    document.getElementById('lopForm').onsubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            MALOP: document.getElementById('l_malop').value,
            TENLOP: document.getElementById('l_tenlop').value,
            KHOAHOC: document.getElementById('l_khoahoc').value,
            MAKHOA: document.getElementById('l_makhoa').value
        };
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/lop/${bodyData.MALOP}` : `/api/lop`;

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
            const result = await res.json();
            if (result.success) {
                closeModal();
                renderLopManager(document.getElementById('panelContent'));
            } else alert(result.message);
        } catch (err) { alert('Lỗi kết nối'); }
    };
};

window.deleteLop = async (malop) => {
    if(!confirm(`Bạn có chắc muốn xóa Lớp ${malop}?`)) return;
    try {
        const res = await fetch(`/api/lop/${malop}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderLopManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

// ==========================================
// 3. MODULE QUẢN LÝ SINH VIÊN
// ==========================================
async function renderSinhVienManager(container) {
    try {
        const res = await fetch('/api/students');
        const data = await res.json();
        
        // Trích xuất các khóa học (năm nhập học) duy nhất có trong dữ liệu
        const yearsSet = new Set();
        const studentsList = (data.success && data.data) ? data.data : [];
        window.currentStudentList = studentsList;

        studentsList.forEach(item => {
            const masv = item.MASV ? item.MASV.trim() : '';
            if (masv.length >= 3) {
                const cohortCode = masv.substring(1, 3);
                if (/^\d+$/.test(cohortCode)) {
                    yearsSet.add(2000 + parseInt(cohortCode));
                }
            }
        });

        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        let yearOptions = '<option value="ALL">Tất cả khóa học</option>';
        sortedYears.forEach(yr => {
            yearOptions += `<option value="${yr}">${yr}</option>`;
        });

        let html = `
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="showSinhVienForm()"><i class="fa-solid fa-plus"></i> Thêm Sinh Viên</button>
                <div class="form-group" style="margin-bottom: 0; display: flex; gap: 8px; align-items: center;">
                    <label style="margin-bottom: 0; white-space: nowrap; font-weight: 500;">Khóa nhập học:</label>
                    <select id="filter_student_year" onchange="filterStudentsByYear()" style="width: 160px; padding: 6px 12px; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; background: #fff;">
                        ${yearOptions}
                    </select>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã SV</th><th>Họ Tên</th><th>Lớp</th><th>Hành động</th></tr></thead>
                    <tbody id="studentTableBody">
        `;
        
        if (studentsList.length > 0) {
            studentsList.forEach(item => {
                // Mã hóa dữ liệu JSON để nhét vào onclick, xử lý an toàn dấu nháy
                const cleanMasv = item.MASV ? item.MASV.trim() : '';
                const cleanMalop = item.MALOP ? item.MALOP.trim() : '';
                const cleanHo = item.HO ? item.HO.trim() : '';
                const cleanTen = item.TEN ? item.TEN.trim() : '';
                const cleanDiachi = item.DIACHI ? item.DIACHI.trim() : '';
                const cleanItem = { ...item, MASV: cleanMasv, MALOP: cleanMalop, HO: cleanHo, TEN: cleanTen, DIACHI: cleanDiachi };
                const svJson = encodeURIComponent(JSON.stringify(cleanItem));
                html += `
                    <tr>
                        <td><strong>${cleanMasv}</strong></td>
                        <td>${cleanHo} ${cleanTen}</td>
                        <td>${cleanMalop}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showSinhVienForm('${svJson}')">Mở chi tiết</button>
                            <button class="btn-sm btn-danger" onclick="deleteSinhVien('${cleanMasv}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="4" style="text-align:center;">Chưa có dữ liệu Sinh Viên</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) { container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`; }
}

window.filterStudentsByYear = () => {
    const selectedYear = document.getElementById('filter_student_year').value;
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    let filtered = window.currentStudentList || [];
    if (selectedYear !== 'ALL') {
        const cohortSuffix = selectedYear.substring(2); // "2023" -> "23"
        filtered = filtered.filter(item => {
            const masv = item.MASV ? item.MASV.trim() : '';
            return masv.length >= 3 && masv.substring(1, 3) === cohortSuffix;
        });
    }

    let html = '';
    if (filtered.length > 0) {
        filtered.forEach(item => {
            const cleanMasv = item.MASV ? item.MASV.trim() : '';
            const cleanMalop = item.MALOP ? item.MALOP.trim() : '';
            const cleanHo = item.HO ? item.HO.trim() : '';
            const cleanTen = item.TEN ? item.TEN.trim() : '';
            const cleanDiachi = item.DIACHI ? item.DIACHI.trim() : '';
            const cleanItem = { ...item, MASV: cleanMasv, MALOP: cleanMalop, HO: cleanHo, TEN: cleanTen, DIACHI: cleanDiachi };
            const svJson = encodeURIComponent(JSON.stringify(cleanItem));
            html += `
                <tr>
                    <td><strong>${cleanMasv}</strong></td>
                    <td>${cleanHo} ${cleanTen}</td>
                    <td>${cleanMalop}</td>
                    <td class="action-btns">
                        <button class="btn-sm btn-secondary" onclick="showSinhVienForm('${svJson}')">Mở chi tiết</button>
                        <button class="btn-sm btn-danger" onclick="deleteSinhVien('${cleanMasv}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="4" style="text-align:center;">Không tìm thấy Sinh Viên nào thuộc khóa này</td></tr>`;
    }
    tbody.innerHTML = html;
};

window.showSinhVienForm = async (svJsonStr = null) => {
    let sv = null;
    const isEdit = !!svJsonStr;
    if(isEdit) {
        sv = JSON.parse(decodeURIComponent(svJsonStr));
    }
    
    // Fetch lop list
    let allLops = [];
    try {
        const lopRes = await fetch('/api/lop');
        const lopData = await lopRes.json();
        if(lopData.success) {
            allLops = lopData.data;
        }
    } catch(e) {}

    let lopOptions = '<option value="">-- Chọn Lớp --</option>';
    allLops.forEach(l => {
        const cleanLMa = l.MALOP.trim();
        const cleanSvLMa = sv && sv.MALOP ? sv.MALOP.trim() : '';
        lopOptions += `<option value="${cleanLMa}" ${cleanSvLMa === cleanLMa ? 'selected' : ''}>${cleanLMa} - ${l.TENLOP.trim()}</option>`;
    });

    // Định dạng ngày sinh YYYY-MM-DD
    let formattedDate = "";
    if (sv && sv.NGAYSINH) {
        formattedDate = new Date(sv.NGAYSINH).toISOString().split('T')[0];
    }

    const formHTML = `
        <form id="svForm" autocomplete="off">
            <div class="form-group">
                <label>Mã SV</label>
                <input type="text" id="sv_masv" value="${sv ? sv.MASV.trim() : ''}" maxlength="10" required oninput="this.value = this.value.toUpperCase().replace(/\\s/g, '')" autocomplete="off">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Họ</label>
                    <input type="text" id="sv_ho" value="${sv ? sv.HO : ''}" required autocomplete="off">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Tên</label>
                    <input type="text" id="sv_ten" value="${sv ? sv.TEN : ''}" required autocomplete="off">
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Phái (Nam = check)</label>
                    <input type="checkbox" id="sv_phai" style="width: auto;" ${sv && sv.PHAI ? 'checked' : ''}>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Đã nghỉ học</label>
                    <input type="checkbox" id="sv_danghi" style="width: auto;" ${sv && sv.DANGHIHOC ? 'checked' : ''}>
                </div>
            </div>
            <div class="form-group">
                <label>Ngày sinh</label>
                <input type="date" id="sv_ngaysinh" value="${formattedDate}" max="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" id="sv_diachi" value="${sv && sv.DIACHI ? sv.DIACHI : ''}" autocomplete="new-address">
            </div>
            <div class="form-group">
                <label>Thuộc Lớp</label>
                <select id="sv_malop" required>${lopOptions}</select>
            </div>
            <div class="form-group">
                <label>Mật khẩu ${isEdit ? '(Để trống nếu không đổi)' : ''}</label>
                <input type="password" id="sv_pass" autocomplete="new-password" ${!isEdit ? "required placeholder='Mặc định 123456'" : ''}>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Chi tiết Sinh Viên' : 'Thêm Sinh Viên', formHTML);

    const populateLopSelect = (yearSuffix = null) => {
        const selectEl = document.getElementById('sv_malop');
        if (!selectEl) return;
        
        let filteredLops = allLops;
        if (yearSuffix) {
            filteredLops = allLops.filter(l => {
                const cleanLMa = l.MALOP.trim();
                // Hậu tố năm học ở index 1, độ dài 2. Ví dụ: D23CQCP01 -> index 1-2 là 23
                const suffix = cleanLMa.substring(1, 3);
                return suffix === yearSuffix;
            });
        }
        
        const cleanSvLMa = sv && sv.MALOP ? sv.MALOP.trim() : '';
        let optionsHtml = '<option value="">-- Chọn Lớp --</option>';
        filteredLops.forEach(l => {
            const cleanLMa = l.MALOP.trim();
            optionsHtml += `<option value="${cleanLMa}" ${cleanSvLMa === cleanLMa ? 'selected' : ''}>${cleanLMa} - ${l.TENLOP.trim()}</option>`;
        });
        selectEl.innerHTML = optionsHtml;
    };

    const masvInput = document.getElementById('sv_masv');
    const handleMasvInput = () => {
        const val = masvInput.value.trim();
        const match = val.match(/^[^0-9]*([0-9]{2})/);
        if (match) {
            populateLopSelect(match[1]);
        } else {
            populateLopSelect(null);
        }
    };

    if (masvInput) {
        masvInput.addEventListener('input', handleMasvInput);
        // Tự động chạy lần đầu để lọc lớp cho các bản ghi sinh viên hiện có khi xem chi tiết/sửa
        handleMasvInput();
    }

    document.getElementById('svForm').onsubmit = async (e) => {
        e.preventDefault();
        const currentMASV = document.getElementById('sv_masv').value.toUpperCase().trim().replace(/\s/g, '');
        const rawHo = document.getElementById('sv_ho').value.trim();
        const rawTen = document.getElementById('sv_ten').value.trim();
        const rawDiachi = document.getElementById('sv_diachi').value.trim();
        const rawMalop = document.getElementById('sv_malop').value.toUpperCase().trim().replace(/\s/g, '');

        if (!currentMASV || !rawHo || !rawTen || !rawMalop) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const bodyData = {
            HO: rawHo,
            TEN: rawTen,
            PHAI: document.getElementById('sv_phai').checked,
            DANGHIHOC: document.getElementById('sv_danghi').checked,
            NGAYSINH: document.getElementById('sv_ngaysinh').value,
            DIACHI: rawDiachi,
            MALOP: rawMalop
        };
        
        const pass = document.getElementById('sv_pass').value;
        if (pass) bodyData.PASSWORD = pass;

        if (isEdit) {
            const originalMASV = sv.MASV.trim();
            if (currentMASV !== originalMASV) {
                bodyData.MASV_MOI = currentMASV;
            }
        } else {
            bodyData.MASV = currentMASV;
        }

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/students/${sv.MASV.trim()}` : `/api/students`;

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
            const result = await res.json();
            if (result.success) {
                closeModal();
                renderSinhVienManager(document.getElementById('panelContent'));
            } else alert(result.message);
        } catch (err) { alert('Lỗi kết nối'); }
    };
};

window.deleteSinhVien = async (masv) => {
    const cleanMasv = masv.trim();
    if(!confirm(`Bạn có chắc muốn xóa Sinh viên ${cleanMasv}?`)) return;
    try {
        const res = await fetch(`/api/students/${cleanMasv}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderSinhVienManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

document.addEventListener('DOMContentLoaded', () => {
    // 0. Gắn tự động JWT token vào toàn bộ các Request Fetch đến Backend API
    const _originalFetch = window.fetch;
    window.fetch = function() {
        let [resource, config] = arguments;
        if (typeof resource === 'string' && resource.startsWith('/api')) {
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
    document.getElementById('welcomeTitle').textContent = `Xin chào, ${user.username}!`;

    const colors = ['4f46e5', '0ea5e9', '10b981', 'f59e0b', 'ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('avatarImg').src = `https://ui-avatars.com/api/?name=${user.username}&background=${randomColor}&color=fff`;

    // 3. Phân quyền Hiển thị Menu (RBAC)
    const menuConfig = {
        'PGV': ['header-quanly', 'menu-khoa', 'menu-lop', 'menu-monhoc', 'menu-giangvien', 'menu-sinhvien', 'header-hoctap', 'menu-loptc', 'menu-dangky', 'menu-diem', 'menu-nhapdiem', 'header-hethong', 'menu-taotk'],
        'KHOA': ['header-hoctap', 'menu-dangky', 'menu-diem', 'menu-nhapdiem', 'header-hethong', 'menu-taotk'],
        'SINHVIEN': ['header-hoctap', 'menu-dangky', 'menu-diem']
    };
    const allowedElements = menuConfig[role] || menuConfig['SINHVIEN'];
    allowedElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });

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
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showKhoaForm()"><i class="fa-solid fa-plus"></i> Thêm Khoa Mới</button>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã Khoa</th><th>Tên Khoa</th><th>Thao tác</th></tr></thead>
                    <tbody>
        `;
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
                html += `
                    <tr>
                        <td><strong>${item.MAKHOA}</strong></td>
                        <td>${item.TENKHOA}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showKhoaForm('${item.MAKHOA}', '${item.TENKHOA}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteKhoa('${item.MAKHOA}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu Khoa</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`;
    }
}

window.showKhoaForm = (makhoa = '', tenkhoa = '') => {
    const isEdit = !!makhoa;
    const formHTML = `
        <form id="khoaForm">
            <div class="form-group">
                <label>Mã Khoa</label>
                <input type="text" id="k_makhoa" value="${makhoa}" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'}>
            </div>
            <div class="form-group">
                <label>Tên Khoa</label>
                <input type="text" id="k_tenkhoa" value="${tenkhoa}" required>
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
        const bodyData = {
            MAKHOA: document.getElementById('k_makhoa').value,
            TENKHOA: document.getElementById('k_tenkhoa').value
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
    if(!confirm(`Bạn có chắc muốn xóa Khoa ${makhoa}?`)) return;
    try {
        const res = await fetch(`/api/khoa/${makhoa}`, { method: 'DELETE' });
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
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showLopForm()"><i class="fa-solid fa-plus"></i> Thêm Lớp Mới</button>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã Lớp</th><th>Tên Lớp</th><th>Khóa Học</th><th>Mã Khoa</th><th>Thao tác</th></tr></thead>
                    <tbody>
        `;
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
                html += `
                    <tr>
                        <td><strong>${item.MALOP}</strong></td>
                        <td>${item.TENLOP}</td>
                        <td>${item.KHOAHOC}</td>
                        <td>${item.MAKHOA}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showLopForm('${item.MALOP}', '${item.TENLOP}', '${item.KHOAHOC}', '${item.MAKHOA}')">Sửa</button>
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

window.showLopForm = async (malop = '', tenlop = '', khoahoc = '', makhoa = '') => {
    const isEdit = !!malop;
    
    // Fetch khoa list for dropdown
    let khoaOptions = '<option value="">-- Chọn Khoa --</option>';
    try {
        const khoaRes = await fetch('/api/khoa');
        const khoaData = await khoaRes.json();
        if(khoaData.success) {
            khoaData.data.forEach(k => {
                khoaOptions += `<option value="${k.MAKHOA}" ${makhoa === k.MAKHOA ? 'selected' : ''}>${k.TENKHOA}</option>`;
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
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showSinhVienForm()"><i class="fa-solid fa-plus"></i> Thêm Sinh Viên</button>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã SV</th><th>Họ Tên</th><th>Lớp</th><th>Hành động</th></tr></thead>
                    <tbody>
        `;
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
                // Mã hóa dữ liệu JSON để nhét vào onclick, xử lý an toàn dấu nháy
                const svJson = encodeURIComponent(JSON.stringify(item));
                html += `
                    <tr>
                        <td><strong>${item.MASV}</strong></td>
                        <td>${item.HO} ${item.TEN}</td>
                        <td>${item.MALOP}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showSinhVienForm('${svJson}')">Mở chi tiết</button>
                            <button class="btn-sm btn-danger" onclick="deleteSinhVien('${item.MASV}')">Xóa</button>
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

window.showSinhVienForm = async (svJsonStr = null) => {
    let sv = null;
    const isEdit = !!svJsonStr;
    if(isEdit) {
        sv = JSON.parse(decodeURIComponent(svJsonStr));
    }
    
    // Fetch lop list
    let lopOptions = '<option value="">-- Chọn Lớp --</option>';
    try {
        const lopRes = await fetch('/api/lop');
        const lopData = await lopRes.json();
        if(lopData.success) {
            lopData.data.forEach(l => {
                lopOptions += `<option value="${l.MALOP}" ${sv && sv.MALOP === l.MALOP ? 'selected' : ''}>${l.MALOP} - ${l.TENLOP}</option>`;
            });
        }
    } catch(e) {}

    // Định dạng ngày sinh YYYY-MM-DD
    let formattedDate = "";
    if (sv && sv.NGAYSINH) {
        formattedDate = new Date(sv.NGAYSINH).toISOString().split('T')[0];
    }

    const formHTML = `
        <form id="svForm">
            <div class="form-group">
                <label>Mã SV</label>
                <input type="text" id="sv_masv" value="${sv ? sv.MASV : ''}" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'}>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Họ</label>
                    <input type="text" id="sv_ho" value="${sv ? sv.HO : ''}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Tên</label>
                    <input type="text" id="sv_ten" value="${sv ? sv.TEN : ''}" required>
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
                <input type="date" id="sv_ngaysinh" value="${formattedDate}">
            </div>
            <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" id="sv_diachi" value="${sv && sv.DIACHI ? sv.DIACHI : ''}">
            </div>
            <div class="form-group">
                <label>Thuộc Lớp</label>
                <select id="sv_malop" required>${lopOptions}</select>
            </div>
            <div class="form-group">
                <label>Mật khẩu ${isEdit ? '(Để trống nếu không đổi)' : ''}</label>
                <input type="password" id="sv_pass" ${!isEdit ? "required placeholder='Mặc định 123456'" : ''}>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Chi tiết Sinh Viên' : 'Thêm Sinh Viên', formHTML);

    document.getElementById('svForm').onsubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            MASV: document.getElementById('sv_masv').value,
            HO: document.getElementById('sv_ho').value,
            TEN: document.getElementById('sv_ten').value,
            PHAI: document.getElementById('sv_phai').checked,
            DANGHIHOC: document.getElementById('sv_danghi').checked,
            NGAYSINH: document.getElementById('sv_ngaysinh').value,
            DIACHI: document.getElementById('sv_diachi').value,
            MALOP: document.getElementById('sv_malop').value
        };
        
        const pass = document.getElementById('sv_pass').value;
        if (pass) bodyData.PASSWORD = pass;

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/students/${bodyData.MASV}` : `/api/students`;

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
    if(!confirm(`Bạn có chắc muốn xóa Sinh viên ${masv}?`)) return;
    try {
        const res = await fetch(`/api/students/${masv}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderSinhVienManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

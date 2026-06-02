// ==========================================
// MODULE TẠO TÀI KHOẢN NỘI BỘ (PGV / KHOA)
// ==========================================

function renderTaoTaiKhoanManager(container) {
    let html = `
        <div class="action-panel" style="max-width: 600px; margin: 0 auto;">
            <div class="panel-header" style="background:#f0f9ff; padding:15px;">
                <h4 style="margin:0; color:#0369a1;"><i class="fa-solid fa-user-plus"></i> Cấp tài khoản mới</h4>
            </div>
            <div class="panel-body" style="padding: 20px;">
                <form id="internalRegisterForm">
                    <div class="form-group">
                        <label>Tên đăng nhập (Thường là Mã Khoa / Mã GV / Mã SV)</label>
                        <input type="text" id="tk_username" required placeholder="VD: CNTT, GV01, N19DCCN001">
                    </div>
                    
                    <div class="form-group">
                        <label>Mật khẩu</label>
                        <input type="password" id="tk_password" required placeholder="Nhập mật khẩu">
                    </div>
                    
                    <div class="form-group">
                        <label>Quyền hạn (Role)</label>
                        <select id="tk_role" required>
                            <option value="">-- Chọn quyền --</option>
                            <option value="PGV">Phòng Giáo Vụ (PGV)</option>
                            <option value="KHOA">Khoa / Giảng Viên (KHOA)</option>
                            <option value="SINHVIEN">Sinh Viên (SINHVIEN)</option>
                        </select>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fa-solid fa-check"></i> Tạo tài khoản
                        </button>
                    </div>
                </form>
                <div id="tk_message" style="margin-top: 15px; text-align: center;"></div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;

    document.getElementById('internalRegisterForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('tk_username').value;
        const password = document.getElementById('tk_password').value;
        const role = document.getElementById('tk_role').value;
        const msgBox = document.getElementById('tk_message');

        msgBox.innerHTML = '<span style="color: blue;"><i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</span>';

        try {
            const res = await fetch('/register-internal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ USERNAME: username, PASSWORD: password, ROLE: role })
            });

            const result = await res.json();
            
            if (res.ok && result.success) {
                msgBox.innerHTML = `<span style="color: green;"><i class="fa-solid fa-circle-check"></i> ${result.message}</span>`;
                document.getElementById('internalRegisterForm').reset();
            } else {
                msgBox.innerHTML = `<span style="color: red;"><i class="fa-solid fa-circle-xmark"></i> Lỗi: ${result.message}</span>`;
            }
        } catch (err) {
            msgBox.innerHTML = `<span style="color: red;"><i class="fa-solid fa-triangle-exclamation"></i> Lỗi kết nối hệ thống.</span>`;
        }
    };
}

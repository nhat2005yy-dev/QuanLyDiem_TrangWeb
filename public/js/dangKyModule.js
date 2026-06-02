// ==========================================
// MODULE ĐĂNG KÝ LỚP TÍN CHỈ (SINH VIÊN)
// ==========================================
async function renderDangKyManager(container) {
    let nk = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
    let hk = 1;

    let html = `
        <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap: wrap;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Niên khóa</label>
                <input type="text" id="dk_nk" value="${nk}" style="width:150px;">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Học kỳ</label>
                <select id="dk_hk" style="width:100px;">
                    <option value="1" ${hk==1?'selected':''}>1</option>
                    <option value="2" ${hk==2?'selected':''}>2</option>
                    <option value="3" ${hk==3?'selected':''}>3</option>
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

    // Tự động load ngay từ đầu
    setTimeout(loadDangKyData, 100);
}

window.loadDangKyData = async () => {
    const nk = document.getElementById('dk_nk').value;
    const hk = document.getElementById('dk_hk').value;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const masv = user.username;

    const availableContainer = document.getElementById('dk_availableClasses');
    const registeredContainer = document.getElementById('dk_registeredClasses');

    availableContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';
    registeredContainer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    try {
        // Lấy danh sách lớp tín chỉ được mở
        const resClasses = await fetch(`/api/classes?NIENKHOA=${nk}&HOCKY=${hk}`);
        const dataClasses = await resClasses.json();
        
        // Lấy danh sách phiếu học phần sinh viên ĐÃ ĐĂNG KÝ
        const resRegistered = await fetch(`/api/course-registration?MASV=${masv}&NIENKHOA=${nk}&HOCKY=${hk}`);
        const dataRegistered = await resRegistered.json();

        // 1. Render Các Lớp Đã Đăng Ký
        let regHtml = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead><tr><th>Mã LTC</th><th>Mã MH</th><th>Tên MH</th><th>Nhóm</th><th>Giảng Viên</th><th>Thao tác</th></tr></thead>
                <tbody>
        `;
        let registeredMaltcSet = new Set();
        if (dataRegistered.success && dataRegistered.data.length > 0) {
            dataRegistered.data.forEach(item => {
                registeredMaltcSet.add(item.MALTC);
                regHtml += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${item.MAMH}</td>
                        <td>${item.TENMH}</td>
                        <td>${item.NHOM}</td>
                        <td>${item.HOTEN_GV}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-danger" onclick="cancelRegistration('${masv}', '${item.MALTC}')">Hủy đăng ký</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            regHtml += `<tr><td colspan="6" style="text-align:center;">Bạn chưa đăng ký môn nào trong học kỳ này</td></tr>`;
        }
        regHtml += `</tbody></table>`;
        registeredContainer.innerHTML = regHtml;

        // 2. Render Các Lớp Đang Mở (bỏ đi các lớp đã đăng ký)
        let availHtml = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead><tr><th>Mã LTC</th><th>Mã MH</th><th>Tên MH</th><th>Nhóm</th><th>Giảng Viên</th><th>Min SV</th><th>Thao tác</th></tr></thead>
                <tbody>
        `;
        
        if (dataClasses.success && dataClasses.data.length > 0) {
            let hasOpenClass = false;
            dataClasses.data.forEach(item => {
                // Nếu lớp chưa bị hủy và sinh viên chưa đăng ký vào lớp đó
                if (!item.HUYLOP && !registeredMaltcSet.has(item.MALTC)) {
                    hasOpenClass = true;
                    availHtml += `
                        <tr>
                            <td><strong>${item.MALTC}</strong></td>
                            <td>${item.MAMH}</td>
                            <td>${item.TENMH}</td>
                            <td>${item.NHOM}</td>
                            <td>${item.HOTEN_GV}</td>
                            <td>${item.SOSVTOITHIEU}</td>
                            <td class="action-btns">
                                <button class="btn-sm btn-primary" onclick="submitRegistration('${masv}', '${item.MALTC}')">Đăng ký</button>
                            </td>
                        </tr>
                    `;
                }
            });
            if (!hasOpenClass) {
                availHtml += `<tr><td colspan="7" style="text-align:center;">Không có lớp tín chỉ nào khả dụng để đăng ký thêm</td></tr>`;
            }
        } else {
            availHtml += `<tr><td colspan="7" style="text-align:center;">Học kỳ này chưa mở lớp tín chỉ nào</td></tr>`;
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
            // alert('Đăng ký thành công!');
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
            // alert('Hủy thành công!');
            loadDangKyData(); // reload
        } else {
            alert('Lỗi hủy đăng ký: ' + result.message);
        }
    } catch(err) {
        alert('Lỗi hệ thống');
    }
};

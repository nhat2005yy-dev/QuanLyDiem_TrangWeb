// ==========================================
// MODULE QUẢN LÝ LỚP TÍN CHỈ (LTC)
// ==========================================
async function renderLopTinChiManager(container) {
    let nk = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1); // VD: 2026-2027
    let hk = 1;

    let html = `
        <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Niên khóa</label>
                <input type="text" id="filter_nk" value="${nk}" style="width:150px;">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Học kỳ</label>
                <select id="filter_hk" style="width:100px;">
                    <option value="1" ${hk==1?'selected':''}>1</option>
                    <option value="2" ${hk==2?'selected':''}>2</option>
                    <option value="3" ${hk==3?'selected':''}>3</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="loadLopTinChiData()">Tra cứu</button>
            <button class="btn btn-secondary" onclick="showLopTinChiForm()" style="margin-left:auto;"><i class="fa-solid fa-plus"></i> Khai báo Lớp Mới</button>
        </div>
        <div class="data-table-container" id="ltcTableContainer">
            <p>Vui lòng ấn Tra cứu để múc dữ liệu...</p>
        </div>
    `;
    container.innerHTML = html;
    
    // Tự động load ngay từ đầu
    setTimeout(loadLopTinChiData, 100);
}

window.loadLopTinChiData = async () => {
    const nk = document.getElementById('filter_nk').value;
    const hk = document.getElementById('filter_hk').value;
    const container = document.getElementById('ltcTableContainer');

    container.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const res = await fetch(`/api/classes?NIENKHOA=${nk}&HOCKY=${hk}`);
        const data = await res.json();
        
        if (!data.success) {
            container.innerHTML = `<p style="color:red;">Lỗi data: ${data.message}</p>`;
            return;
        }

        let html = `
            <table class="data-table" style="font-size:0.9rem;">
                <thead><tr><th>Mã LTC</th><th>Mã MH</th><th>Tên MH</th><th>Nhóm</th><th>Giảng Viên</th><th>SV Tối Thiểu</th><th>Trạng Thái</th><th>Thao tác</th></tr></thead>
                <tbody>
        `;
        
        if (data.data.length > 0) {
            data.data.forEach(item => {
                const ltcJson = encodeURIComponent(JSON.stringify(item));
                html += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${item.MAMH}</td>
                        <td>${item.TENMH}</td>
                        <td>${item.NHOM}</td>
                        <td>${item.HOTEN_GV} (${item.MAGV})</td>
                        <td>${item.SOSVTOITHIEU}</td>
                        <td>${item.HUYLOP ? '<span style="color:red">Đã Hủy</span>' : '<span style="color:green">Hoạt Động</span>'}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showLopTinChiForm('${ltcJson}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteLopTinChi('${item.MALTC}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="8" style="text-align:center;">Chưa có dữ liệu Lớp tín chỉ cho Học kỳ / Niên khóa này</td></tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch(err) {
        container.innerHTML = `<p style="color:red;">Lỗi kết nối: ${err.message}</p>`;
    }
};

window.showLopTinChiForm = async (ltcJsonStr = null) => {
    let ltc = null;
    let isEdit = false;
    if(ltcJsonStr) {
        ltc = JSON.parse(decodeURIComponent(ltcJsonStr));
        isEdit = true;
    }

    // Lấy default NK, HK từ thanh công cụ nếu là thêm mới
    const defaultNK = document.getElementById('filter_nk')?.value || '';
    const defaultHK = document.getElementById('filter_hk')?.value || '1';

    // Fetch Mon Hoc
    let mhOptions = '<option value="">-- Chọn Môn --</option>';
    try {
        const mhRes = await fetch('/api/monhoc');
        const mhData = await mhRes.json();
        if(mhData.success) {
            mhData.data.forEach(m => {
                mhOptions += `<option value="${m.MAMH}" ${ltc && ltc.MAMH === m.MAMH ? 'selected' : ''}>${m.MAMH} - ${m.TENMH}</option>`;
            });
        }
    } catch(e){}

    // Fetch Khoa
    let khoaOptions = '<option value="">-- Chọn Khoa --</option>';
    try {
        const kRes = await fetch('/api/khoa');
        const kData = await kRes.json();
        if(kData.success) {
            kData.data.forEach(k => {
                khoaOptions += `<option value="${k.MAKHOA}" ${ltc && ltc.MAKHOA === k.MAKHOA ? 'selected' : ''}>${k.TENKHOA}</option>`;
            });
        }
    } catch(e){}

    // Fetch Giang Vien (Có thể tối ưu bằng cách lọc GV theo dropdown Khoa, nhưng cứ xổ hết ra cho đơn giản)
    let gvOptions = '<option value="">-- Chọn GV --</option>';
    try {
        const gvRes = await fetch('/api/giangvien');
        const gvData = await gvRes.json();
        if(gvData.success) {
            gvData.data.forEach(g => {
                gvOptions += `<option value="${g.MAGV}" data-khoa="${g.MAKHOA}" ${ltc && ltc.MAGV === g.MAGV ? 'selected' : ''}>${g.MAGV} - ${g.HO} ${g.TEN}</option>`;
            });
        }
    } catch(e){}

    const formHTML = `
        <form id="ltcForm">
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Niên Khóa</label>
                    <input type="text" id="ltc_nienkhoa" value="${ltc ? ltc.NIENKHOA : defaultNK}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Học Kỳ</label>
                    <select id="ltc_hocky">
                        <option value="1" ${(ltc ? ltc.HOCKY == 1 : defaultHK == 1) ? 'selected' : ''}>1</option>
                        <option value="2" ${(ltc ? ltc.HOCKY == 2 : defaultHK == 2) ? 'selected' : ''}>2</option>
                        <option value="3" ${(ltc ? ltc.HOCKY == 3 : defaultHK == 3) ? 'selected' : ''}>3</option>
                    </select>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:2;">
                    <label>Môn Học</label>
                    <select id="ltc_mamh" required>${mhOptions}</select>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Số Nhóm</label>
                    <input type="number" id="ltc_nhom" min="1" value="${ltc ? ltc.NHOM : 1}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Khoa quản lý mở lớp</label>
                <select id="ltc_makhoa" required>${khoaOptions}</select>
            </div>
            <div class="form-group">
                <label>Giảng Viên</label>
                <select id="ltc_magv" required>${gvOptions}</select>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>SV Tối thiểu</label>
                    <input type="number" id="ltc_svtoithieu" min="1" value="${ltc ? ltc.SOSVTOITHIEU : 10}" required>
                </div>
                <div class="form-group" style="flex:1; display:flex; align-items:center;">
                    <label style="margin-right:10px; margin-bottom:0;">Hủy Lớp</label>
                    <input type="checkbox" id="ltc_huylop" style="width:20px; height:20px;" ${ltc && ltc.HUYLOP ? 'checked' : ''}>
                </div>
            </div>
            <div class="form-actions" style="margin-top:20px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu Lớp Tín Chỉ</button>
            </div>
        </form>
    `;

    openModal(isEdit ? `Sửa Lớp TC Mã [${ltc.MALTC}]` : 'Khai Báo Lớp TC Mới', formHTML);

    document.getElementById('ltcForm').onsubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            NIENKHOA: document.getElementById('ltc_nienkhoa').value,
            HOCKY: parseInt(document.getElementById('ltc_hocky').value),
            MAMH: document.getElementById('ltc_mamh').value,
            NHOM: parseInt(document.getElementById('ltc_nhom').value),
            MAGV: document.getElementById('ltc_magv').value,
            MAKHOA: document.getElementById('ltc_makhoa').value,
            SOSVTOITHIEU: parseInt(document.getElementById('ltc_svtoithieu').value),
            HUYLOP: document.getElementById('ltc_huylop').checked
        };
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/classes/${ltc.MALTC}` : `/api/classes`;

        try {
            const res = await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(bodyData) });
            const result = await res.json();
            if(result.success) {
                closeModal();
                loadLopTinChiData(); // Hàm tải lại bảng LTC
            } else alert(result.message);
        } catch(err) { alert('Lỗi kết nối server!'); }
    };
};

window.deleteLopTinChi = async (maltc) => {
    if(!confirm(`Bạn có chắc muốn KHAI TỬ hoàn toàn Lớp Tín Chỉ Mã ${maltc}? Sẽ không thể phục hồi.`)) return;
    try {
        const res = await fetch(`/api/classes/${maltc}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) loadLopTinChiData();
        else alert(result.message);
    } catch(err) { alert('Hệ thống từ chối truy cập.'); }
};

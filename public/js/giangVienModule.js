// ==========================================
// MODULE QUẢN LÝ GIẢNG VIÊN
// ==========================================
async function renderGiangVienManager(container) {
    try {
        // Fetch Danh Sách GV
        const resGv = await fetch('/api/giangvien');
        const dataGv = await resGv.json();

        // Fetch nhanh Khoa làm dictionary để hiện tên khoa
        const resKhoa = await fetch('/api/khoa');
        const dataKhoa = await resKhoa.json();
        const khoaDict = {};
        if(dataKhoa.success) {
            dataKhoa.data.forEach(k => { khoaDict[k.MAKHOA] = k.TENKHOA; });
        }

        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showGiangVienForm()"><i class="fa-solid fa-plus"></i> Thêm Giảng Viên</button>
            </div>
            <div class="data-table-container">
                <table class="data-table" style="font-size:0.9rem;">
                    <thead><tr><th>Mã NV</th><th>Họ Tên</th><th>Học Vị/Hàm</th><th>Chuyên Môn</th><th>Khoa</th><th>Thao tác</th></tr></thead>
                    <tbody>
        `;
        
        if (dataGv.success && dataGv.data.length > 0) {
            dataGv.data.forEach(item => {
                const hvhh = [item.HOCHAM, item.HOCVI].filter(x => x).join(', ') || '-';
                const tk = khoaDict[item.MAKHOA] || item.MAKHOA;
                const gvJson = encodeURIComponent(JSON.stringify(item));
                html += `
                    <tr>
                        <td><strong>${item.MAGV}</strong></td>
                        <td>${item.HO} ${item.TEN}</td>
                        <td>${hvhh}</td>
                        <td>${item.CHUYENMON || '-'}</td>
                        <td>${tk}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showGiangVienForm('${gvJson}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteGiangVien('${item.MAGV}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="6" style="text-align:center;">Chưa có dữ liệu Giảng Viên</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) { container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`; }
}

window.showGiangVienForm = async (gvJsonStr = null) => {
    let gv = null;
    const isEdit = !!gvJsonStr;
    if(isEdit) gv = JSON.parse(decodeURIComponent(gvJsonStr));

    // Fetch Khoa list
    let khoaOptions = '<option value="">-- Chọn Khoa --</option>';
    try {
        const khoaRes = await fetch('/api/khoa');
        const khoaData = await khoaRes.json();
        if(khoaData.success) {
            khoaData.data.forEach(k => {
                khoaOptions += `<option value="${k.MAKHOA}" ${gv && gv.MAKHOA === k.MAKHOA ? 'selected' : ''}>${k.TENKHOA}</option>`;
            });
        }
    } catch(e) {}

    const formHTML = `
        <form id="gvForm">
            <div class="form-group">
                <label>Mã Giảng Viên (MAGV)</label>
                <input type="text" id="gv_magv" value="${gv ? gv.MAGV : ''}" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'}>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Họ</label>
                    <input type="text" id="gv_ho" value="${gv ? gv.HO : ''}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Tên</label>
                    <input type="text" id="gv_ten" value="${gv ? gv.TEN : ''}" required>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Học Vị</label>
                    <input type="text" id="gv_hocvi" value="${gv && gv.HOCVI ? gv.HOCVI : ''}" placeholder="VD: Thạc sĩ">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Học Hàm</label>
                    <input type="text" id="gv_hocham" value="${gv && gv.HOCHAM ? gv.HOCHAM : ''}" placeholder="VD: PGS">
                </div>
            </div>
            <div class="form-group">
                <label>Chuyên Môn</label>
                <input type="text" id="gv_chuyenmon" value="${gv && gv.CHUYENMON ? gv.CHUYENMON : ''}">
            </div>
            <div class="form-group">
                <label>Thuộc Khoa</label>
                <select id="gv_makhoa" required>${khoaOptions}</select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Sửa Giảng Viên' : 'Thêm Giảng Viên', formHTML);

    document.getElementById('gvForm').onsubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            MAGV: document.getElementById('gv_magv').value,
            HO: document.getElementById('gv_ho').value,
            TEN: document.getElementById('gv_ten').value,
            HOCVI: document.getElementById('gv_hocvi').value || null,
            HOCHAM: document.getElementById('gv_hocham').value || null,
            CHUYENMON: document.getElementById('gv_chuyenmon').value || null,
            MAKHOA: document.getElementById('gv_makhoa').value
        };
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/giangvien/${bodyData.MAGV}` : `/api/giangvien`;

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
            const result = await res.json();
            if (result.success) {
                closeModal();
                renderGiangVienManager(document.getElementById('panelContent'));
            } else alert(result.message);
        } catch (err) { alert('Lỗi kết nối'); }
    };
};

window.deleteGiangVien = async (magv) => {
    if(!confirm(`Bạn có chắc muốn xóa Giảng Viên ${magv}?`)) return;
    try {
        const res = await fetch(`/api/giangvien/${magv}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderGiangVienManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

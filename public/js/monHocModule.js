// ==========================================
// MODULE QUẢN LÝ MÔN HỌC
// ==========================================
async function renderMonHocManager(container) {
    try {
        const res = await fetch('/api/monhoc');
        const data = await res.json();
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="showMonHocForm()"><i class="fa-solid fa-plus"></i> Thêm Môn Học</button>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Mã Môn Học</th><th>Tên Môn Học</th><th>STC Lý Thuyết</th><th>STC Thực Hành</th><th>Thao tác</th></tr></thead>
                    <tbody>
        `;
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(item => {
                const cleanMamh = item.MAMH ? item.MAMH.trim() : '';
                const cleanTenmh = item.TENMH ? item.TENMH.trim() : '';
                html += `
                    <tr>
                        <td><strong>${cleanMamh}</strong></td>
                        <td>${cleanTenmh}</td>
                        <td>${item.SOTINCHI_LT || 0}</td>
                        <td>${item.SOTINCHI_TH || 0}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showMonHocForm('${cleanMamh}', '${cleanTenmh}', ${item.SOTINCHI_LT || 0}, ${item.SOTINCHI_TH || 0})">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteMonHoc('${cleanMamh}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="5" style="text-align:center;">Chưa có dữ liệu Môn Học</td></tr>`;
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (err) { container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`; }
}

window.showMonHocForm = (mamh = '', tenmh = '', stc_lt = 0, stc_th = 0) => {
    const cleanMamh = mamh.trim().toUpperCase();
    const cleanTenmh = tenmh.trim();
    const isEdit = !!cleanMamh;
    const formHTML = `
        <form id="monHocForm">
            <div class="form-group">
                <label>Mã Môn Học</label>
                <input type="text" id="mh_mamh" value="${cleanMamh}" maxlength="10" ${isEdit ? 'readonly style="background:#f3f4f6"' : 'required'} oninput="this.value = this.value.toUpperCase().replace(/\\s/g, '')">
            </div>
            <div class="form-group">
                <label>Tên Môn Học</label>
                <input type="text" id="mh_tenmh" value="${cleanTenmh}" maxlength="50" required>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Số TC Lý Thuyết</label>
                    <input type="number" min="0" id="mh_stclt" value="${stc_lt}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Số TC Thực Hành</label>
                    <input type="number" min="0" id="mh_stcth" value="${stc_th}" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    `;
    openModal(isEdit ? 'Sửa Môn Học' : 'Thêm Môn Học', formHTML);

    document.getElementById('monHocForm').onsubmit = async (e) => {
        e.preventDefault();
        const rawMAMH = document.getElementById('mh_mamh').value.toUpperCase().trim().replace(/\s/g, '');
        const rawTenMH = document.getElementById('mh_tenmh').value.trim();

        if (!rawMAMH || !rawTenMH) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const bodyData = {
            MAMH: rawMAMH,
            TENMH: rawTenMH,
            SOTINCHI_LT: parseInt(document.getElementById('mh_stclt').value) || 0,
            SOTINCHI_TH: parseInt(document.getElementById('mh_stcth').value) || 0
        };
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/monhoc/${cleanMamh}` : `/api/monhoc`;

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
            const result = await res.json();
            if (result.success) {
                closeModal();
                renderMonHocManager(document.getElementById('panelContent'));
            } else alert(result.message);
        } catch (err) { alert('Lỗi kết nối'); }
    };
};

window.deleteMonHoc = async (mamh) => {
    const cleanMamh = mamh.trim();
    if(!confirm(`Bạn có chắc muốn xóa Môn Học ${cleanMamh}?`)) return;
    try {
        const res = await fetch(`/api/monhoc/${cleanMamh}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) renderMonHocManager(document.getElementById('panelContent'));
        else alert(result.message);
    } catch (err) { alert('Lỗi hệ thống'); }
};

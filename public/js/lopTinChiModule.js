// ==========================================
// MODULE QUẢN LÝ LỚP TÍN CHỈ (LTC)
// ==========================================
async function renderLopTinChiManager(container) {
    const currentYear = new Date().getFullYear();
    const maxFutureYear = currentYear + 3; // SP cho phép tạo trước tối đa 3 năm
    let fromYearOptions = '';
    let toYearOptions = '';
    for (let y = 2020; y <= maxFutureYear; y++) {
        fromYearOptions += `<option value="${y}" ${y === 2020 ? 'selected' : ''}>${y}</option>`;
        toYearOptions += `<option value="${y}" ${y === maxFutureYear ? 'selected' : ''}>${y}</option>`;
    }

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

    let html = `
        <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
            <div class="form-group" style="margin-bottom:0;">
                <label>Từ năm</label>
                <select id="filter_from_nk" style="width:120px;">${fromYearOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Đến năm</label>
                <select id="filter_to_nk" style="width:120px;">${toYearOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Học kỳ</label>
                <select id="filter_hk" style="width:100px;">
                    <option value="ALL">Tất cả</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Trạng thái</label>
                <select id="filter_status" style="width:150px;">
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                    <option value="FUTURE">Chưa mở</option>
                    <option value="CANCELED">Đã hủy</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Khoa</label>
                <select id="filter_loptc_khoa" style="width:180px;">
                    ${khoaOptions}
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

function getClassStatus(item) {
    if (item.HUYLOP === true || item.HUYLOP === 1 || item.HUYLOP === 'true') {
        return 'CANCELED';
    }
    const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
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

        if (now < startDate) return 'FUTURE';
        if (now >= startDate && now <= endDate) return 'ACTIVE';
        return 'INACTIVE';
    }
    return 'INACTIVE';
}

window.loadLopTinChiData = async () => {
    const currentYear = new Date().getFullYear();
    const fromYear = parseInt(document.getElementById('filter_from_nk').value);
    const toYear = parseInt(document.getElementById('filter_to_nk').value);
    const hkFilter = document.getElementById('filter_hk').value;
    const container = document.getElementById('ltcTableContainer');

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
                    fetch(`/api/classes?NIENKHOA=${nk}&HOCKY=${hkVal}`)
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

        const statusFilter = document.getElementById('filter_status').value;
        const khoaFilter = document.getElementById('filter_loptc_khoa').value;
        let filteredClasses = allClasses;
        if (statusFilter !== 'ALL') {
            filteredClasses = filteredClasses.filter(item => getClassStatus(item) === statusFilter);
        }
        if (khoaFilter !== 'ALL') {
            filteredClasses = filteredClasses.filter(item => (item.MAKHOA ? item.MAKHOA.trim() : '') === khoaFilter);
        }

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
                        <th>SV Tối Thiểu</th>
                        <th>Trạng Thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (filteredClasses.length > 0) {
            filteredClasses.forEach(item => {
                const ltcJson = encodeURIComponent(JSON.stringify(item));
                const cleanNienkhoa = item.NIENKHOA ? item.NIENKHOA.trim() : '';
                const cleanMamh = item.MAMH ? item.MAMH.trim() : '';
                const cleanTenmh = item.TENMH ? item.TENMH.trim() : '';
                const cleanHotenGv = item.HOTEN_GV ? item.HOTEN_GV.trim() : '';
                const cleanMagv = item.MAGV ? item.MAGV.trim() : '';

                // Xác định trạng thái hoạt động dựa trên niên khóa và cờ hủy lớp
                const status = getClassStatus(item);
                let statusHtml = '';
                if (status === 'CANCELED') {
                    statusHtml = '<span style="color:red">Đã Hủy</span>';
                } else if (status === 'FUTURE') {
                    statusHtml = '<span style="color:orange">Chưa mở</span>';
                } else if (status === 'ACTIVE') {
                    statusHtml = '<span style="color:green">Hoạt động</span>';
                } else {
                    statusHtml = '<span style="color:red">Không hoạt động</span>';
                }

                html += `
                    <tr>
                        <td><strong>${item.MALTC}</strong></td>
                        <td>${cleanNienkhoa}</td>
                        <td>Học kỳ ${item.HOCKY}</td>
                        <td>${cleanMamh}</td>
                        <td>${cleanTenmh}</td>
                        <td>${item.NHOM}</td>
                        <td>${cleanHotenGv} (${cleanMagv})</td>
                        <td>${item.SOSVTOITHIEU}</td>
                        <td>${statusHtml}</td>
                        <td class="action-btns">
                            <button class="btn-sm btn-secondary" onclick="showLopTinChiForm('${ltcJson}')">Sửa</button>
                            <button class="btn-sm btn-danger" onclick="deleteLopTinChi('${item.MALTC}')">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="10" style="text-align:center;">Chưa có dữ liệu Lớp tín chỉ cho khoảng thời gian này</td></tr>`;
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
    const filterFromNk = document.getElementById('filter_from_nk')?.value;
    const defaultNK = filterFromNk ? `${filterFromNk}-${parseInt(filterFromNk)+1}` : '';
    const filterHk = document.getElementById('filter_hk')?.value;
    const defaultHK = (filterHk && filterHk !== 'ALL') ? filterHk : '1';

    // Tạo danh sách niên khóa hợp lệ (Giới hạn từ năm hiện tại và 3 năm tới)
    const currentYear = new Date().getFullYear();
    const maxFutureYears = 3;
    let nienKhoaOptions = '';
    
    const activeNK = ltc ? ltc.NIENKHOA.trim() : defaultNK.trim();
    let optionsList = [];
    
    // Thêm niên khóa hiện tại của lớp nếu đang trong chế độ sửa
    if (isEdit && activeNK) {
        optionsList.push(activeNK);
    }
    
    for (let i = -1; i <= maxFutureYears; i++) {
        const startY = currentYear + i;
        const endY = startY + 1;
        const nkVal = `${startY}-${endY}`;
        if (!optionsList.includes(nkVal)) {
            optionsList.push(nkVal);
        }
    }
    
    optionsList.sort();
    
    optionsList.forEach(nkVal => {
        nienKhoaOptions += `<option value="${nkVal}" ${activeNK === nkVal ? 'selected' : ''}>${nkVal}</option>`;
    });

    // Fetch Mon Hoc
    let mhOptions = '<option value="">-- Chọn Môn --</option>';
    try {
        const mhRes = await fetch('/api/monhoc');
        const mhData = await mhRes.json();
        if(mhData.success) {
            mhData.data.forEach(m => {
                mhOptions += `<option value="${m.MAMH.trim()}" ${ltc && ltc.MAMH.trim() === m.MAMH.trim() ? 'selected' : ''}>${m.MAMH.trim()} - ${m.TENMH.trim()}</option>`;
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
                const cleanKMa = k.MAKHOA.trim();
                const cleanLtcMa = ltc && ltc.MAKHOA ? ltc.MAKHOA.trim() : '';
                khoaOptions += `<option value="${cleanKMa}" ${cleanLtcMa === cleanKMa ? 'selected' : ''}>${k.TENKHOA.trim()}</option>`;
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
                const cleanGvMa = g.MAKHOA ? g.MAKHOA.trim() : '';
                gvOptions += `<option value="${g.MAGV.trim()}" data-khoa="${cleanGvMa}" ${ltc && ltc.MAGV.trim() === g.MAGV.trim() ? 'selected' : ''}>${g.MAGV.trim()} - ${g.HO} ${g.TEN}</option>`;
            });
        }
    } catch(e){}

    const formHTML = `
        <form id="ltcForm">
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Niên Khóa</label>
                    <select id="ltc_nienkhoa">${nienKhoaOptions}</select>
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
                    <input type="number" id="ltc_nhom" min="1" value="${ltc ? ltc.NHOM : ''}" readonly style="background-color: #e9ecef; cursor: not-allowed;" required>
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

    const nienKhoaSelect = document.getElementById('ltc_nienkhoa');
    const hocKySelect = document.getElementById('ltc_hocky');
    const mamhSelect = document.getElementById('ltc_mamh');
    const nhomInput = document.getElementById('ltc_nhom');

    const updateNextNhomPreview = async () => {
        if (isEdit) return;

        const nk = nienKhoaSelect.value;
        const hk = hocKySelect.value;
        const mamh = mamhSelect.value;

        if (!nk || !hk || !mamh) {
            nhomInput.value = '';
            return;
        }

        try {
            const res = await fetch(`/api/classes/next-nhom?NIENKHOA=${encodeURIComponent(nk)}&HOCKY=${encodeURIComponent(hk)}&MAMH=${encodeURIComponent(mamh)}`);
            const data = await res.json();
            if (data.success) {
                nhomInput.value = data.nhom;
            } else {
                nhomInput.value = '';
            }
        } catch (err) {
            console.error('Lỗi khi lấy số nhóm tiếp theo:', err);
            nhomInput.value = '';
        }
    };

    if (!isEdit) {
        nienKhoaSelect.addEventListener('change', updateNextNhomPreview);
        hocKySelect.addEventListener('change', updateNextNhomPreview);
        mamhSelect.addEventListener('change', updateNextNhomPreview);
        updateNextNhomPreview();
    }

    document.getElementById('ltcForm').onsubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            NIENKHOA: document.getElementById('ltc_nienkhoa').value,
            HOCKY: parseInt(document.getElementById('ltc_hocky').value),
            MAMH: document.getElementById('ltc_mamh').value,
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

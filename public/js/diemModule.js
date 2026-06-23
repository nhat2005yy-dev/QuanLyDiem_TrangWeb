// ==========================================
// MODULE XEM PHIẾU ĐIỂM (SINH VIÊN)
// ==========================================

async function renderDiemManager(container) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const masv = user.username;

    let html = `
        <div class="action-panel" style="margin-top: 0;">
            <div class="panel-header" style="background:#f8fafc; padding:15px;">
                <h4 style="margin:0; color:#0f172a;"><i class="fa-solid fa-graduation-cap"></i> Phiếu Điểm Của Sinh Viên: <strong>${masv}</strong></h4>
            </div>
            <div class="panel-body data-table-container" id="pd_gradesContainer">
                <div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> Đang tải dữ liệu điểm...</div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    try {
        const res = await fetch(`/api/grades?MASV=${masv}`);
        const data = await res.json();
        
        const gradesContainer = document.getElementById('pd_gradesContainer');
        
        if (!data.success) {
            gradesContainer.innerHTML = `<p style="color:red; text-align:center;">Lỗi tải dữ liệu: ${data.message}</p>`;
            return;
        }

        const sortedGrades = data.data.sort((a, b) => {
            const cleanA = a.NIENKHOA ? a.NIENKHOA.trim() : '';
            const cleanB = b.NIENKHOA ? b.NIENKHOA.trim() : '';
            if (cleanA !== cleanB) {
                return cleanA.localeCompare(cleanB);
            }
            return (a.HOCKY || 0) - (b.HOCKY || 0);
        });

        const groups = {};
        sortedGrades.forEach(item => {
            const cleanNK = item.NIENKHOA ? item.NIENKHOA.trim() : 'Chưa rõ';
            const hk = item.HOCKY || 'Chưa rõ';
            const key = `${cleanNK}_HK${hk}`;
            if (!groups[key]) {
                groups[key] = {
                    nienkhoa: cleanNK,
                    hocky: hk,
                    items: []
                };
            }
            groups[key].items.push(item);
        });

        let tableHtml = '';
        const groupKeys = Object.keys(groups);
        if (groupKeys.length > 0) {
            groupKeys.forEach(key => {
                const group = groups[key];
                tableHtml += `
                    <div class="semester-grade-section" style="margin-bottom: 30px;">
                        <h4 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 10px; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-regular fa-calendar-check" style="color: #3b82f6;"></i> Niên khóa: <span style="color: #0f172a;">${group.nienkhoa}</span> &nbsp;|&nbsp; Học kỳ: <span style="color: #0f172a;">${group.hocky}</span>
                        </h4>
                        <table class="data-table" style="margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th style="width: 60px; text-align:center;">STT</th>
                                    <th>Tên Môn Học</th>
                                    <th style="text-align:center; width: 100px;">Điểm CC<br><small>(10%)</small></th>
                                    <th style="text-align:center; width: 100px;">Điểm GK<br><small>(30%)</small></th>
                                    <th style="text-align:center; width: 100px;">Điểm CK<br><small>(60%)</small></th>
                                    <th style="text-align:center; width: 120px;">Điểm Tổng</th>
                                    <th style="text-align:center; width: 100px;">Hệ chữ</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                group.items.forEach((item, index) => {
                    let cc = item.DIEM_CC !== null ? item.DIEM_CC : '-';
                    let gk = item.DIEM_GK !== null ? item.DIEM_GK : '-';
                    let ck = item.DIEM_CK !== null ? item.DIEM_CK : '-';
                    let tong = item.DIEM_TONG !== null ? item.DIEM_TONG : '-';
                    
                    let heChu = '-';
                    let color = '#333';
                    if (tong !== '-') {
                        let diem = parseFloat(tong);
                        if (diem >= 8.5) { heChu = 'A'; color = '#16a34a'; }
                        else if (diem >= 7.0) { heChu = 'B'; color = '#2563eb'; }
                        else if (diem >= 5.5) { heChu = 'C'; color = '#d97706'; }
                        else if (diem >= 4.0) { heChu = 'D'; color = '#ea580c'; }
                        else { heChu = 'F'; color = '#dc2626'; }
                    }

                    tableHtml += `
                        <tr>
                            <td style="text-align:center;">${index + 1}</td>
                            <td><strong>${item.TENMH ? item.TENMH.trim() : ''}</strong></td>
                            <td style="text-align:center;">${cc}</td>
                            <td style="text-align:center;">${gk}</td>
                            <td style="text-align:center;">${ck}</td>
                            <td style="text-align:center; font-weight:bold;">${tong}</td>
                            <td style="text-align:center; font-weight:bold; color:${color}">${heChu}</td>
                        </tr>
                    `;
                });

                tableHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
            });
        } else {
            tableHtml += `
                <div style="text-align:center; padding: 40px 20px; background:#f8fafc; border-radius:8px; border: 1px dashed #cbd5e1; margin: 10px 0;">
                    <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 10px;"></i>
                    <p style="color: #64748b; font-weight: 500; margin: 0;">Chưa có dữ liệu điểm học tập nào được ghi nhận</p>
                </div>
            `;
        }
        
        gradesContainer.innerHTML = tableHtml;

    } catch (err) {
        document.getElementById('pd_gradesContainer').innerHTML = `<p style="color:red; text-align:center;">Lỗi kết nối: ${err.message}</p>`;
    }
}

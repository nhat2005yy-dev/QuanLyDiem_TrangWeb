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

        let tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên Môn Học</th>
                        <th style="text-align:center;">Điểm CC<br><small>(10%)</small></th>
                        <th style="text-align:center;">Điểm GK<br><small>(30%)</small></th>
                        <th style="text-align:center;">Điểm CK<br><small>(60%)</small></th>
                        <th style="text-align:center;">Điểm Tổng</th>
                        <th style="text-align:center;">Hệ chữ</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.data.length > 0) {
            data.data.forEach((item, index) => {
                let cc = item.DIEM_CC !== null ? item.DIEM_CC : '-';
                let gk = item.DIEM_GK !== null ? item.DIEM_GK : '-';
                let ck = item.DIEM_CK !== null ? item.DIEM_CK : '-';
                let tong = item.DIEM_TONG !== null ? item.DIEM_TONG : '-';
                
                // Phân loại điểm chữ cơ bản
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
                        <td><strong>${item.TENMH}</strong></td>
                        <td style="text-align:center;">${cc}</td>
                        <td style="text-align:center;">${gk}</td>
                        <td style="text-align:center;">${ck}</td>
                        <td style="text-align:center; font-weight:bold;">${tong}</td>
                        <td style="text-align:center; font-weight:bold; color:${color}">${heChu}</td>
                    </tr>
                `;
            });
        } else {
            tableHtml += `<tr><td colspan="7" style="text-align:center;">Chưa có dữ liệu điểm</td></tr>`;
        }
        
        tableHtml += `</tbody></table>`;
        gradesContainer.innerHTML = tableHtml;

    } catch (err) {
        document.getElementById('pd_gradesContainer').innerHTML = `<p style="color:red; text-align:center;">Lỗi kết nối: ${err.message}</p>`;
    }
}

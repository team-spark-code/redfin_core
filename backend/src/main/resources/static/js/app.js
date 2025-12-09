let currentFileName = '';
let structuredData = null;

// 페이지 로드시 파일 목록 로드
document.addEventListener('DOMContentLoaded', function() {
    loadFileList();
});

// 파일 목록 로드
function loadFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '로딩 중...';

    fetch('/api/files/data')
        .then(response => response.json())
        .then(files => {
            if (files && files.length > 0) {
                fileList.innerHTML = files.map(file =>
                    `<li><a href="#" onclick="loadFileColumns('${file}')">${file}</a></li>`
                ).join('');
            } else {
                fileList.innerHTML = '<li>d:\\data 폴더에 .jsonl 파일이 없습니다.</li>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            fileList.innerHTML = '<li>파일 목록을 불러오는데 실패했습니다.</li>';
        });
}

// 파일의 컬럼 정보 로드
function loadFileColumns(fileName) {
    currentFileName = fileName;
    const columnSection = document.getElementById('columnSection');
    const dataSection = document.getElementById('dataSection');
    const saveResult = document.getElementById('saveResult');

    // 이전 결과 숨기기
    dataSection.style.display = 'none';
    saveResult.style.display = 'none';

    fetch(`/api/files/data/${encodeURIComponent(fileName)}/columns`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('오류: ' + data.error);
                return;
            }

            // 파일 통계 표시
            document.getElementById('fileStats').innerHTML = `
                <p><strong>파일명:</strong> ${fileName}</p>
                <p><strong>총 레코드 수:</strong> ${data.totalRecords}</p>
                <p><strong>총 컬럼 수:</strong> ${data.totalColumns}</p>
            `;

            // 컬럼 상세 정보 표시
            const columnInfo = document.getElementById('columnInfo');
            columnInfo.innerHTML = `
                <h4>컬럼 상세 정보</h4>
                <div class="table-container">
                    <table class="column-info-table">
                        <thead>
                            <tr>
                                <th>컬럼명</th>
                                <th>데이터 타입</th>
                                <th>레코드 수</th>
                                <th>비율</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.columnDetails.map(col => `
                                <tr>
                                    <td class="column-name">${col.name}</td>
                                    <td class="column-type">${col.type}</td>
                                    <td class="column-count">${col.count.toLocaleString()}</td>
                                    <td class="column-percentage">${col.percentage}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            columnSection.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('컬럼 정보를 불러오는데 실패했습니다.');
        });
}

// 구조화된 데이터 로드
function loadStructuredData() {
    if (!currentFileName) {
        alert('파일을 먼저 선택해주세요.');
        return;
    }

    const dataSection = document.getElementById('dataSection');
    dataSection.innerHTML = '<h3>데이터 테이블</h3><p>로딩 중...</p>';
    dataSection.style.display = 'block';

    fetch(`/api/files/data/${encodeURIComponent(currentFileName)}/structured`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                dataSection.innerHTML = '<h3>데이터 테이블</h3><p>오류: ' + data.error + '</p>';
                return;
            }

            structuredData = data;
            displayDataTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
            dataSection.innerHTML = '<h3>데이터 테이블</h3><p>데이터를 불러오는데 실패했습니다.</p>';
        });
}

// 데이터 테이블 표시 - 개선된 버전
function displayDataTable(data) {
    const dataSection = document.getElementById('dataSection');
    const columns = data.columns;
    const records = data.data;

    // 컬럼 선택 옵션 업데이트
    const columnSelect = document.getElementById('columnSelect');
    if (columnSelect) {
        columnSelect.innerHTML = '<option value="">모든 컬럼</option>' +
            columns.map(col => `<option value="${col}">${col}</option>`).join('');
    }

    // 데이터 타입 추론
    const inferColumnType = (column, records) => {
        const sample = records.find(r => r[column] != null && r[column] !== '');
        if (!sample) return 'unknown';

        const value = sample[column];
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'string') {
            if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
            if (value.match(/^https?:\/\//)) return 'url';
            if (value.includes('@')) return 'email';
            if (value.length > 100) return 'longtext';
        }
        return 'text';
    };

    // 테이블 생성
    let tableHTML = `
        <div class="column-filter">
            <input type="text" id="searchInput" placeholder="검색어 입력..." onkeyup="filterTable()">
            <select id="columnSelect" onchange="filterByColumn()">
                <option value="">모든 컬럼</option>
                ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" onclick="exportData()">CSV 내보내기</button>
            <button class="btn btn-secondary" onclick="toggleTableView()">테이블 뷰 전환</button>
        </div>
        <div class="table-container">
            <table id="dataTable">
                <thead>
                    <tr>${columns.map(col => {
                        const type = inferColumnType(col, records);
                        return `<th class="column-header-${type}" title="컬럼 타입: ${type}">
                            <span class="column-name">${col}</span>
                            <span class="column-type-badge">${type}</span>
                        </th>`;
                    }).join('')}</tr>
                </thead>
                <tbody>
    `;

    // 처음 100개 레코드만 표시 (성능을 위해)
    const displayRecords = records.slice(0, 100);

    displayRecords.forEach((record, index) => {
        tableHTML += `<tr data-row-index="${index}">`;
        columns.forEach(col => {
            const value = record[col];
            const type = inferColumnType(col, records);
            let displayValue = value;
            let cellClass = `cell-type-${type}`;

            // 값 타입별 포맷팅
            if (value === null || value === undefined || value === '') {
                displayValue = '<span class="null-value">NULL</span>';
                cellClass += ' null-cell';
            } else if (type === 'url') {
                displayValue = `<a href="${value}" target="_blank" class="url-link">${value.substring(0, 50)}${value.length > 50 ? '...' : ''}</a>`;
            } else if (type === 'email') {
                displayValue = `<a href="mailto:${value}" class="email-link">${value}</a>`;
            } else if (type === 'date') {
                displayValue = `<span class="date-value">${value}</span>`;
            } else if (type === 'number') {
                displayValue = `<span class="number-value">${Number(value).toLocaleString()}</span>`;
            } else if (type === 'longtext') {
                displayValue = `<span class="long-text" title="${value ? value.toString().replace(/"/g, '&quot;') : ''}">${value ? value.toString().substring(0, 100) + '...' : ''}</span>`;
            } else if (typeof value === 'string' && value.length > 50) {
                displayValue = `<span class="truncated-text" title="${value.replace(/"/g, '&quot;')}">${value.substring(0, 50)}...</span>`;
            }

            tableHTML += `<td class="${cellClass}" data-full-value="${value ? value.toString().replace(/"/g, '&quot;') : ''}">${displayValue || ''}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
        <div class="table-info">
            <span class="record-count">총 ${records.length.toLocaleString()}개 레코드 중 ${displayRecords.length.toLocaleString()}개 표시</span>
            <span class="column-count">${columns.length}개 컬럼</span>
        </div>
    `;

    dataSection.innerHTML = '<h3>데이터 테이블</h3>' + tableHTML;

    // 테이블 행 클릭 이벤트 추가
    addTableRowClickEvents();
}

// 데이터베이스에 저장
function saveToDatabase() {
    if (!currentFileName) {
        alert('파일을 먼저 선택해주세요.');
        return;
    }

    const saveResult = document.getElementById('saveResult');
    saveResult.innerHTML = '<p>저장 중...</p>';
    saveResult.style.display = 'block';

    fetch(`/api/files/data/${encodeURIComponent(currentFileName)}/save-to-db`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            saveResult.innerHTML = `
                <div class="alert alert-success">
                    <strong>성공!</strong> ${data.message}<br>
                    저장된 레코드 수: ${data.savedRecords}
                </div>
            `;
        } else {
            saveResult.innerHTML = `
                <div class="alert alert-error">
                    <strong>오류:</strong> ${data.message}
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        saveResult.innerHTML = `
            <div class="alert alert-error">
                <strong>오류:</strong> 저장 중 네트워크 오류가 발생했습니다.
            </div>
        `;
    });
}

// 테이블 필터링
function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('dataTable');

    if (!searchInput || !table) return;

    const filter = searchInput.value.toLowerCase();
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        let shouldShow = false;

        const cells = row.getElementsByTagName('td');
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(filter) > -1) {
                shouldShow = true;
                break;
            }
        }

        row.style.display = shouldShow ? '' : 'none';
    }
}

// 컬럼별 필터링
function filterByColumn() {
    const columnSelect = document.getElementById('columnSelect');
    const table = document.getElementById('dataTable');

    if (!columnSelect || !table || !structuredData) return;

    const selectedColumn = columnSelect.value;

    if (!selectedColumn) {
        // 모든 컬럼 표시
        displayDataTable(structuredData);
        return;
    }

    // 선택된 컬럼만 표시
    const columns = [selectedColumn];
    const records = structuredData.data.map(record => ({
        [selectedColumn]: record[selectedColumn]
    }));

    displayDataTable({ columns, data: records });
}

// CSV 내보내기
function exportData() {
    if (!structuredData) {
        alert('데이터를 먼저 로드해주세요.');
        return;
    }

    const columns = structuredData.columns;
    const records = structuredData.data;

    let csvContent = columns.join(',') + '\n';

    records.forEach(record => {
        const row = columns.map(col => {
            const value = record[col];
            // CSV를 위해 따옴표와 쉼표 처리
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            return value || '';
        });
        csvContent += row.join(',') + '\n';
    });

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', currentFileName.replace('.jsonl', '.csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

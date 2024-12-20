let currentOperators = [];

document.addEventListener('DOMContentLoaded', () => {
    // 초기:
    // 제목, 검색창, 클래스/공지사항 버튼, 공지사항 표시
    // 서브클래스, 오퍼레이터 리스트는 숨김(HTML에서 style 설정)
    // 여기서는 특별히 추가 작업 없음
});

function showNotices() {
    // 공지사항 표시
    document.getElementById('notice-section').style.display = 'block';
    // 서브클래스, 오퍼레이터 숨기기
    document.getElementById('subclass-selection').style.display = 'none';
    document.getElementById('operator-list').style.display = 'none';

    // 클래스 버튼 active 초기화, 공지사항 버튼 active
    document.querySelectorAll('#class-selection .fancy-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const noticeButton = document.querySelector('#class-selection .fancy-button:first-child');
    if (noticeButton) noticeButton.classList.add('active');
}

async function loadSubClasses(mainClass) {
    // 공지사항 숨기기
    document.getElementById('notice-section').style.display = 'none';

    // 클래스 버튼 상태 업데이트
    document.querySelectorAll('#class-selection .fancy-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === mainClass) {
            btn.classList.add('active');
        }
    });

    try {
        const classResponse = await fetch('classes.json');
        const classes = await classResponse.json();
        const subClasses = classes[mainClass] || [];
        displaySubClasses(subClasses, mainClass);

        const operatorResponse = await fetch('operators.json');
        const operatorsData = await operatorResponse.json();
        
        currentOperators = operatorsData
            .filter(op => op.mainClass === mainClass)
            .sort((a, b) => b.rarity - a.rarity);

        // 서브클래스, 오퍼레이터 표시
        document.getElementById('subclass-selection').style.display = 'flex';
        document.getElementById('operator-list').style.display = 'grid';
        displayOperators(currentOperators);
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

function displaySubClasses(subClasses, mainClass) {
    const subclassSelection = document.getElementById('subclass-selection');
    subclassSelection.innerHTML = '';

    const allButton = createButton('전체', () => loadOperators(mainClass));
    allButton.classList.add('active');
    subclassSelection.appendChild(allButton);

    subClasses.forEach(subClass => {
        const button = createButton(subClass, () => loadOperators(mainClass, subClass));
        subclassSelection.appendChild(button);
    });
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.className = 'fancy-button';
    button.textContent = text;
    button.onclick = () => {
        document.querySelectorAll('#subclass-selection .fancy-button')
            .forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        onClick();
    };
    return button;
}

async function loadOperators(mainClass, subClass = null) {
    try {
        const response = await fetch('operators.json');
        const operatorsData = await response.json();

        currentOperators = operatorsData
            .filter(op => op.mainClass === mainClass)
            .filter(op => !subClass || op.subClass === subClass)
            .sort((a, b) => b.rarity - a.rarity);

        displayOperators(currentOperators);
    } catch (error) {
        console.error('Failed to load operators:', error);
    }
}

function displayOperators(operators) {
    const operatorList = document.getElementById('operator-list');
    operatorList.innerHTML = '';

    operators.forEach(operator => {
        const card = createOperatorCard(operator);
        operatorList.appendChild(card);
    });
}

function createOperatorCard(operator) {
    const card = document.createElement('div');
    card.className = 'operator-card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const image = document.createElement('img');
    image.src = operator.imageUrl;
    image.alt = operator.name;
    image.className = 'operator-thumb';

    const info = document.createElement('div');
    info.className = 'operator-info';
    info.innerHTML = `
        <div class="operator-name">${operator.name}</div>
        <div class="operator-class">${operator.mainClass} - ${operator.subClass}</div>
        <div class="operator-rarity">${'★'.repeat(operator.rarity)}</div>
    `;

    const details = document.createElement('div');
    details.className = 'card-details';

    const moduleGrid = document.createElement('div');
    moduleGrid.className = 'module-grid';

    const modules = [];
    if (operator.module1) modules.push({ type: 'X형', url: operator.module1 });
    if (operator.module2) modules.push({ type: 'Y형', url: operator.module2 });
    if (operator.module3) modules.push({ type: 'Δ형', url: operator.module3 });
    if (operator.module4) modules.push({ type: 'α형', url: operator.module4 });

    if (modules.length > 0) {
        details.innerHTML = '<h3 style="color: #00d1d4; margin: 0.5rem 0;">모듈 정보</h3>';
        modules.forEach(({ type, url }) => {
            const moduleItem = document.createElement('div');
            moduleItem.className = 'module-item';
            moduleItem.innerHTML = `
                <h4>${type} 모듈</h4>
                <img src="${url}" alt="${type} 모듈" class="module-img" onclick="showZoomedImage('${url}')">
            `;
            moduleGrid.appendChild(moduleItem);
        });

        details.appendChild(moduleGrid);
    }

    header.appendChild(image);
    header.appendChild(info);
    card.appendChild(header);
    card.appendChild(details);

    header.addEventListener('click', () => {
        const wasExpanded = details.classList.contains('expanded');
        document.querySelectorAll('.operator-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.card-details')?.classList.remove('expanded');
        });
        if (!wasExpanded) {
            details.classList.add('expanded');
            card.classList.add('selected');
        }
    });

    return card;
}

function showZoomedImage(imageUrl) {
    const overlay = document.getElementById('zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');

    zoomedImage.src = imageUrl;
    overlay.style.display = 'flex';
    event.stopPropagation();
}

document.getElementById('zoom-overlay').addEventListener('click', function(e) {
    if (e.target === this || e.target.className === 'zoom-close') {
        this.style.display = 'none';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('zoom-overlay').style.display = 'none';
    }
});

async function searchOperator() {
    const searchTerm = document.getElementById('operator-search').value.trim().toLowerCase();
    if (!searchTerm) {
        alert('오퍼레이터 이름을 입력하세요.');
        return;
    }

    try {
        const response = await fetch('operators.json');
        const operatorsData = await response.json();
        const searchResults = operatorsData
            .filter(op => op.name.toLowerCase().includes(searchTerm))
            .sort((a, b) => b.rarity - a.rarity);

        displayOperators(searchResults);

        // 검색 결과 표시 시 공지사항/서브클래스 숨기고 오퍼레이터 표시
        document.getElementById('notice-section').style.display = 'none';
        document.getElementById('subclass-selection').style.display = 'none';
        document.getElementById('operator-list').style.display = 'grid';

        // 클래스 버튼 active 해제
        document.querySelectorAll('#class-selection .fancy-button').forEach(btn => {
            btn.classList.remove('active');
        });
    } catch (error) {
        console.error('Error in search:', error);
    }
}

document.getElementById('operator-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchOperator();
    }
});

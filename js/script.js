// script.js
let currentOperators = [];

async function loadSubClasses(mainClass) {
    try {
        document.querySelectorAll('#class-selection .fancy-button').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === mainClass);
        });

        const classResponse = await fetch('classes.json');
        const classes = await classResponse.json();
        
        const subClasses = classes[mainClass] || [];
        displaySubClasses(subClasses, mainClass);
        
        const operatorResponse = await fetch('operators.json');
        const operatorsData = await operatorResponse.json();
        
        currentOperators = operatorsData
            .filter(op => op.mainClass === mainClass)
            .sort((a, b) => b.rarity - a.rarity);

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
    
    // 기본 정보 표시
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
    
    // 모듈 정보를 하나의 섹션으로 통합
    const moduleGrid = document.createElement('div');
    moduleGrid.className = 'module-grid';

    // 모듈 유형과 URL을 순서대로 정리
    const modules = [];
    if (operator.module1) modules.push({ type: 'X형', url: operator.module1 });
    if (operator.module2) modules.push({ type: 'Y형', url: operator.module2 });
    if (operator.module3) modules.push({ type: 'Δ형', url: operator.module3 });
    if (operator.module4) modules.push({ type: 'α형', url: operator.module4 });

    // 모든 모듈을 하나의 카드에 표시
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
    
    // 카드 조립
    header.appendChild(image);
    header.appendChild(info);
    card.appendChild(header);
    card.appendChild(details);
    
    // 클릭 이벤트 - 카드 확장
    header.addEventListener('click', () => {
        const wasExpanded = details.classList.contains('expanded');
        
        // 모든 카드의 선택 상태와 상세 정보를 초기화
        document.querySelectorAll('.operator-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.card-details')?.classList.remove('expanded');
        });
        
        // 현재 카드가 접혀있었다면 펼치고 선택 상태로 표시
        if (!wasExpanded) {
            details.classList.add('expanded');
            card.classList.add('selected');
        }
    });
    
    return card;
}

// 이미지 줌 기능
function showZoomedImage(imageUrl) {
    const overlay = document.getElementById('zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');
    
    zoomedImage.src = imageUrl;
    overlay.style.display = 'flex';
    
    // 이벤트 전파 중지
    event.stopPropagation();
}

// 줌 오버레이 닫기
document.getElementById('zoom-overlay').addEventListener('click', function(e) {
    if (e.target === this || e.target.className === 'zoom-close') {
        this.style.display = 'none';
    }
});

// ESC 키로 줌 오버레이 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('zoom-overlay').style.display = 'none';
    }
});

// 검색 기능
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
    } catch (error) {
        console.error('Error in search:', error);
    }
}

// 검색 입력창 엔터 키 이벤트
document.getElementById('operator-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchOperator();
    }
});

// 페이지 로드 시 기본 클래스 로드
document.addEventListener('DOMContentLoaded', () => {
    loadSubClasses('뱅가드');  // 기본값으로 뱅가드 선택
});
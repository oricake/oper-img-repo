async function fetchJson(url) {
  const response = await fetch(url);
  return await response.json();
}

async function loadSubClasses(mainClass) {
  const url = 'https://raw.githubusercontent.com/oricake/oper-img-repo/main/classes.json'; // classes.json 파일 URL
  const classes = await fetchJson(url);
  displaySubClasses(classes[mainClass] || []);
}

function displaySubClasses(subClasses) {
  const subclassSelection = document.getElementById('subclass-selection');
  subclassSelection.innerHTML = ''; // 기존 버튼을 제거
  subClasses.forEach(subClass => {
    const button = document.createElement('button');
    button.className = 'fancy-button';
    button.textContent = subClass;
    button.onclick = () => loadOperators(subClass);
    subclassSelection.appendChild(button);
  });
}

async function loadOperators(subClass) {
  const url = 'https://raw.githubusercontent.com/oricake/oper-img-repo/main/operators.json'; // operators.json 파일 URL
  const operators = await fetchJson(url);
  const filteredOperators = operators.filter(operator => operator.subClass === subClass);

  // 희귀도 등급순으로 정렬 (높은 등급 순서)
  filteredOperators.sort((a, b) => b.rarity - a.rarity);

  displayOperators(filteredOperators);
}

function displayOperators(operators) {
  const operatorList = document.getElementById('operator-list');
  operatorList.innerHTML = '';
  
  operators.forEach(operator => {
    const operatorDiv = document.createElement('div');
    operatorDiv.className = 'operator';

    // 기본 이미지와 이름 추가
    const operatorImg = document.createElement('img');
    operatorImg.src = operator.imageUrl;
    operatorImg.alt = operator.name;
    operatorImg.width = 100;
    operatorDiv.appendChild(operatorImg);

    const operatorName = document.createElement('p');
    operatorName.textContent = operator.name;
    operatorDiv.appendChild(operatorName);

    // 모듈 드롭다운 생성
    const moduleSelect = document.createElement('select');
    moduleSelect.className = 'module-select';
    
    // 기본 옵션 추가
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '모듈 선택';
    moduleSelect.appendChild(defaultOption);

    // 사용 가능한 모듈만 옵션으로 추가
    const moduleTypes = [
      { key: 'module1', label: 'X형' },
      { key: 'module2', label: 'Y형' },
      { key: 'module3', label: 'Δ형' },
      { key: 'module4', label: 'α형' }
    ];

    let hasModules = false;
    moduleTypes.forEach(({key, label}) => {
      if (operator[key]) {
        hasModules = true;
        const option = document.createElement('option');
        option.value = operator[key];
        option.textContent = label;
        moduleSelect.appendChild(option);
      }
    });

    // 모듈이 있는 경우에만 드롭다운 추가
    if (hasModules) {
      operatorDiv.appendChild(moduleSelect);

      // 모듈 이미지를 표시할 컨테이너
      const moduleImageContainer = document.createElement('div');
      moduleImageContainer.className = 'module-image-container';
      operatorDiv.appendChild(moduleImageContainer);

      // 드롭다운 변경 이벤트 처리
      moduleSelect.addEventListener('change', (e) => {
        const selectedUrl = e.target.value;
        moduleImageContainer.innerHTML = '';
        
        if (selectedUrl) {
          const moduleImg = document.createElement('img');
          moduleImg.src = selectedUrl;
          moduleImg.className = 'module-image';
          moduleImg.style.display = 'block';
          moduleImageContainer.appendChild(moduleImg);
          operatorDiv.classList.add('module-active');
        } else {
          operatorDiv.classList.remove('module-active');
        }
      });
    }

    operatorList.appendChild(operatorDiv);
  });
}

function toggleModule(moduleUrl, operatorDiv) {
  const moduleImage = operatorDiv.querySelector('.module-image');
  const noModuleText = operatorDiv.querySelector('.no-module');

  if (moduleUrl) {
    if (moduleImage.style.display === 'block' && moduleImage.src === moduleUrl) {
      moduleImage.style.display = 'none';
      operatorDiv.classList.remove('module-active');
    } else {
      moduleImage.src = moduleUrl;
      moduleImage.style.display = 'block';
      noModuleText.style.display = 'none';
      operatorDiv.classList.add('module-active');
    }
  } else {
    if (noModuleText.style.display === 'block') {
      noModuleText.style.display = 'none';
      operatorDiv.classList.remove('module-active');
    } else {
      moduleImage.style.display = 'none';
      noModuleText.style.display = 'block';
      operatorDiv.classList.remove('module-active');
    }
  }
}

async function searchOperator() {
  const operatorName = document.getElementById('operator-search').value.trim();
  if (operatorName) {
    const url = 'https://raw.githubusercontent.com/oricake/oper-img-repo/main/operators.json'; // operators.json 파일 URL
    const operators = await fetchJson(url);
    const filteredOperators = operators.filter(operator => operator.name.toLowerCase().includes(operatorName.toLowerCase()));

    // 희귀도 등급순으로 정렬 (높은 등급 순서)
    filteredOperators.sort((a, b) => b.rarity - a.rarity);

    displayOperators(filteredOperators);
  } else {
    alert("오퍼레이터 이름을 입력하세요.");
  }
}

// 모듈이 있는 경우 버튼에 .has-module 클래스 추가
function checkModules() {
  fetchJson('https://raw.githubusercontent.com/oricake/oper-img-repo/main/operators.json').then(operators => {
    operators.forEach(operator => {
      if (operator.module1 || operator.module2 || operator.module3) {
        const button = document.querySelector(`[data-operator="${operator.name}"]`);
        if (button) {
          button.classList.add('has-module');
        }
      }
    });
  });
}

// 페이지 로드 시 모듈 확인 함수 호출
document.addEventListener('DOMContentLoaded', (event) => {
  checkModules();
});

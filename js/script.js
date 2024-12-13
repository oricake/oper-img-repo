const OPERATORS_URL = 'https://raw.githubusercontent.com/oricake/oper-img-repo/main/operators.json';
const CLASSES_URL = 'https://raw.githubusercontent.com/oricake/oper-img-repo/main/classes.json';
const MODULE_BUTTON_TEXTS = ['X형', 'Y형', 'Δ형', 'α형'];

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    return null; 
  }
}

async function onMainClassChange() {
  const mainClassSelect = document.getElementById('main-class-select');
  const selectedMainClass = mainClassSelect.value;
  
  const subclassSelect = document.getElementById('subclass-select');
  subclassSelect.innerHTML = '<option value="">서브클래스를 선택하세요</option>';

  if (!selectedMainClass) {
    subclassSelect.style.display = 'none';
    clearOperators();
    return;
  }

  const classes = await fetchJson(CLASSES_URL);
  if (!classes) {
    displayError('클래스 정보를 불러오지 못했습니다.');
    return;
  }

  const subClasses = classes[selectedMainClass] || [];
  if (subClasses.length === 0) {
    subclassSelect.style.display = 'none';
    displayError('해당 메인 클래스에 서브클래스가 없습니다.');
    return;
  }

  // 서브클래스 옵션 추가
  subClasses.forEach(subClass => {
    const option = document.createElement('option');
    option.value = subClass;
    option.textContent = subClass;
    subclassSelect.appendChild(option);
  });
  
  subclassSelect.style.display = 'inline-block';
  clearOperators();
}

async function onSubClassChange() {
  const subclassSelect = document.getElementById('subclass-select');
  const selectedSubClass = subclassSelect.value;

  if (!selectedSubClass) {
    clearOperators();
    return;
  }

  loadOperators(selectedSubClass);
}

async function loadOperators(subClass) {
  const operators = await fetchJson(OPERATORS_URL);
  if (!operators) {
    console.warn('Failed to load operators data.');
    displayError('오퍼레이터 정보를 불러오지 못했습니다.');
    return;
  }

  const filteredOperators = operators.filter(op => op.subClass === subClass);
  filteredOperators.sort((a, b) => b.rarity - a.rarity);

  displayOperators(filteredOperators);
}

function displayOperators(operators) {
  const operatorList = document.getElementById('operator-list');
  operatorList.innerHTML = '';

  if (operators.length === 0) {
    const noResult = document.createElement('p');
    noResult.textContent = '해당 조건에 맞는 오퍼레이터가 없습니다.';
    operatorList.appendChild(noResult);
    return;
  }

  operators.forEach(operator => {
    const operatorDiv = document.createElement('div');
    operatorDiv.className = 'operator';

    const operatorImg = document.createElement('img');
    operatorImg.src = operator.imageUrl;
    operatorImg.alt = operator.name;
    operatorDiv.appendChild(operatorImg);

    const operatorName = document.createElement('p');
    operatorName.textContent = operator.name;
    operatorDiv.appendChild(operatorName);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details';

    const modules = [operator.module1, operator.module2, operator.module3, operator.module4];
    modules.forEach((moduleUrl, index) => {
      const detailButton = document.createElement('span');
      detailButton.className = 'detail-button';
      detailButton.textContent = MODULE_BUTTON_TEXTS[index];

      if (moduleUrl) {
        detailButton.classList.add('green');
        detailButton.onclick = (event) => {
          event.preventDefault();
          toggleModule(moduleUrl, operatorDiv);
        };
      } else {
        detailButton.classList.add('gray');
        detailButton.onclick = (event) => {
          event.preventDefault();
          toggleModule(null, operatorDiv);
        };
      }

      detailsDiv.appendChild(detailButton);
    });

    operatorDiv.appendChild(detailsDiv);

    const moduleImage = document.createElement('img');
    moduleImage.className = 'module-image';
    moduleImage.style.display = 'none';
    operatorDiv.appendChild(moduleImage);

    const noModuleText = document.createElement('p');
    noModuleText.className = 'no-module';
    noModuleText.textContent = '해당 모듈이 없습니다.';
    noModuleText.style.display = 'none';
    operatorDiv.appendChild(noModuleText);

    operatorList.appendChild(operatorDiv);
  });
}

function toggleModule(moduleUrl, operatorDiv) {
  const moduleImage = operatorDiv.querySelector('.module-image');
  const noModuleText = operatorDiv.querySelector('.no-module');

  moduleImage.style.display = 'none';
  noModuleText.style.display = 'none';

  if (moduleUrl) {
    if (operatorDiv.classList.contains('module-active') && moduleImage.src === moduleUrl) {
      operatorDiv.classList.remove('module-active');
      return;
    }
    moduleImage.src = moduleUrl;
    moduleImage.style.display = 'block';
    operatorDiv.classList.add('module-active');
  } else {
    operatorDiv.classList.remove('module-active');
    noModuleText.style.display = 'block';
  }
}

async function searchOperator() {
  const operatorName = document.getElementById('operator-search').value.trim();
  if (!operatorName) {
    alert("오퍼레이터 이름을 입력하세요.");
    return;
  }

  const operators = await fetchJson(OPERATORS_URL);
  if (!operators) {
    console.warn('Failed to load operators data.');
    displayError('오퍼레이터 정보를 불러오지 못했습니다.');
    return;
  }

  const filteredOperators = operators.filter(op =>
    op.name.toLowerCase().includes(operatorName.toLowerCase())
  );

  filteredOperators.sort((a, b) => b.rarity - a.rarity);

  displayOperators(filteredOperators);
}

function displayError(message) {
  const operatorList = document.getElementById('operator-list');
  operatorList.innerHTML = '';
  const errorMsg = document.createElement('p');
  errorMsg.style.color = 'red';
  errorMsg.textContent = message;
  operatorList.appendChild(errorMsg);
}

function clearOperators() {
  const operatorList = document.getElementById('operator-list');
  operatorList.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // 필요하다면 초기 상태 로딩 등
});

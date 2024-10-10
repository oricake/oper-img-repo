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
  console.log(operators); // 디버깅을 위해 operators 로그 출력
  const operatorList = document.getElementById('operator-list');
  operatorList.innerHTML = ''; // 기존 오퍼레이터 목록을 제거
  operators.forEach(operator => {
    console.log("Displaying Operator: " + operator.name + ", Image URL: " + operator.imageUrl);
    const operatorDiv = document.createElement('div');
    operatorDiv.className = 'operator';

    const operatorImg = document.createElement('img');
    operatorImg.src = operator.imageUrl;
    operatorImg.alt = operator.name;
    operatorImg.width = 100;
    console.log("Image Source: " + operatorImg.src); // 이미지 URL 확인
    operatorDiv.appendChild(operatorImg);

    const operatorName = document.createElement('p');
    operatorName.textContent = operator.name;
    operatorDiv.appendChild(operatorName);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details';

    // 버튼 텍스트 배열
    const buttonTexts = ['X형', 'Y형', 'Δ형', 'α형'];
    
    ['module1', 'module2', 'module3', 'module4'].forEach((module, index) => {
      const detailButton = document.createElement('span');
      detailButton.className = 'detail-button';
      detailButton.textContent = buttonTexts[index]; // 버튼 텍스트 설정

      if (operator[module]) {
        detailButton.classList.add('green');
        detailButton.onclick = (event) => {
          event.preventDefault();
          toggleModule(operator[module], operatorDiv);
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
    operatorDiv.appendChild(moduleImage);

    const noModuleText = document.createElement('p');
    noModuleText.className = 'no-module';
    noModuleText.textContent = '해당 모듈이 없습니다.';
    operatorDiv.appendChild(noModuleText);

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

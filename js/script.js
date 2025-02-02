/**
 * 개선된 script.js
 *
 * - operators.json, classes.json 데이터를 최초 로드 시 캐싱하여 중복 요청을 줄입니다.
 * - DOM 요소를 미리 캐싱하고, inline 이벤트 대신 data‑속성을 이용해 이벤트 위임을 적용했습니다.
 * - 요소의 표시/숨김은 CSS의 .hidden 클래스를 활용합니다.
 * - 특히, 줌 오버레이(#zoom-overlay)는 display 속성을 'flex'로 설정해 크게 보이도록 처리합니다.
 */

(function () {
  // 데이터 캐싱
  const cache = {
    operators: null,
    classes: null
  };

  // URL에 따른 데이터를 가져오고 캐싱합니다.
  function fetchData(url) {
    if (url === 'operators.json' && cache.operators) {
      return Promise.resolve(cache.operators);
    } else if (url === 'classes.json' && cache.classes) {
      return Promise.resolve(cache.classes);
    }
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`네트워크 에러: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (url === 'operators.json') cache.operators = data;
        if (url === 'classes.json') cache.classes = data;
        return data;
      });
  }

  // 요소의 표시/숨김 헬퍼 함수 (CSS의 .hidden 클래스를 활용)
  // 단, 줌 오버레이인 경우 display 속성을 'flex'로 설정하여 크게 보이도록 함
  function showElement(el) {
    el.classList.remove('hidden');
    if (el.id === 'zoom-overlay') {
      el.style.display = 'flex';
    }
  }
  function hideElement(el) {
    el.classList.add('hidden');
    if (el.id === 'zoom-overlay') {
      el.style.display = 'none';
    }
  }

  // 여러 요소에서 active 클래스를 제거하는 함수
  function removeActive(elements) {
    elements.forEach(el => el.classList.remove('active'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 자주 사용하는 DOM 요소 캐싱
    const dom = {
      noticeSection: document.getElementById('notice-section'),
      subclassSelection: document.getElementById('subclass-selection'),
      operatorList: document.getElementById('operator-list'),
      classSelection: document.getElementById('class-selection'),
      zoomOverlay: document.getElementById('zoom-overlay'),
      zoomedImage: document.getElementById('zoomed-image'),
      operatorSearch: document.getElementById('operator-search'),
      searchButton: document.getElementById('search-button')
    };

    let currentOperators = [];

    // 이벤트 위임: #class-selection 내부의 버튼 클릭 처리
    dom.classSelection.addEventListener('click', function (event) {
      const target = event.target;
      if (target.tagName.toLowerCase() !== 'button') return;
      const action = target.dataset.action;
      if (action === 'showNotices') {
        showNotices();
      } else if (action === 'loadSubClasses') {
        const mainClass = target.dataset.mainClass;
        if (mainClass) {
          loadSubClasses(mainClass);
        }
      }
    });

    // 검색 버튼 클릭 이벤트 처리
    if (dom.searchButton) {
      dom.searchButton.addEventListener('click', searchOperator);
    }
    // 검색 입력에서 엔터 키 이벤트 처리
    dom.operatorSearch.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchOperator();
      }
    });

    // 줌 오버레이 클릭 시 닫기 처리 (오버레이 배경이나 닫기 버튼 클릭 시)
    dom.zoomOverlay.addEventListener('click', function (e) {
      if (e.target === this || e.target.classList.contains('zoom-close')) {
        hideElement(this);
      }
    });
    // ESC 키 누르면 줌 오버레이 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideElement(dom.zoomOverlay);
      }
    });

    // --- 기능 함수들 ---

    // 공지사항 표시 및 관련 섹션 숨김
    function showNotices() {
      showElement(dom.noticeSection);
      hideElement(dom.subclassSelection);
      hideElement(dom.operatorList);

      // 클래스 선택 버튼(active) 상태 초기화 (첫 번째 버튼을 활성화)
      const classButtons = dom.classSelection.querySelectorAll('.fancy-button');
      removeActive(classButtons);
      if (classButtons.length > 0) {
        classButtons[0].classList.add('active');
      }
    }

    // 선택한 메인 클래스에 따라 서브클래스와 오퍼레이터 목록 로드
    async function loadSubClasses(mainClass) {
      hideElement(dom.noticeSection);

      // 클래스 버튼의 active 상태 업데이트
      const classButtons = dom.classSelection.querySelectorAll('.fancy-button');
      removeActive(classButtons);
      classButtons.forEach(btn => {
        if (btn.textContent === mainClass) {
          btn.classList.add('active');
        }
      });

      try {
        const classesData = await fetchData('classes.json');
        const subClasses = classesData[mainClass] || [];
        displaySubClasses(subClasses, mainClass);

        const operatorsData = await fetchData('operators.json');
        currentOperators = operatorsData
          .filter(op => op.mainClass === mainClass)
          .sort((a, b) => b.rarity - a.rarity);

        showElement(dom.subclassSelection);
        showElement(dom.operatorList);
        displayOperators(currentOperators);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('데이터를 불러오는 데 실패했습니다.');
      }
    }

    // 서브클래스 버튼들을 생성하여 표시
    function displaySubClasses(subClasses, mainClass) {
      dom.subclassSelection.innerHTML = '';

      // '전체' 버튼: 서브클래스 필터 없이 전체 오퍼레이터 로드
      const allButton = createButton('전체', () => loadOperators(mainClass));
      allButton.classList.add('active');
      dom.subclassSelection.appendChild(allButton);

      subClasses.forEach(subClass => {
        const button = createButton(subClass, () => loadOperators(mainClass, subClass));
        dom.subclassSelection.appendChild(button);
      });
    }

    // 버튼 생성 헬퍼 함수
    function createButton(text, onClick) {
      const button = document.createElement('button');
      button.className = 'fancy-button';
      button.textContent = text;
      button.addEventListener('click', function () {
        const buttons = dom.subclassSelection.querySelectorAll('.fancy-button');
        removeActive(buttons);
        button.classList.add('active');
        onClick();
      });
      return button;
    }

    // 메인 클래스(및 선택한 서브클래스)에 따른 오퍼레이터 데이터를 로드
    async function loadOperators(mainClass, subClass = null) {
      try {
        const operatorsData = await fetchData('operators.json');
        currentOperators = operatorsData
          .filter(op => op.mainClass === mainClass)
          .filter(op => !subClass || op.subClass === subClass)
          .sort((a, b) => b.rarity - a.rarity);

        displayOperators(currentOperators);
      } catch (error) {
        console.error('오퍼레이터 로드 실패:', error);
        alert('오퍼레이터 데이터를 불러오는 데 실패했습니다.');
      }
    }

    // 오퍼레이터 카드를 생성하여 표시
    function displayOperators(operators) {
      dom.operatorList.innerHTML = '';
      operators.forEach(operator => {
        const card = createOperatorCard(operator);
        dom.operatorList.appendChild(card);
      });
    }

    // 오퍼레이터 카드 생성
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
        const title = document.createElement('h3');
        title.style.color = '#00d1d4';
        title.style.margin = '0.5rem 0';
        title.textContent = '모듈 정보';
        details.appendChild(title);

        modules.forEach(({ type, url }) => {
          const moduleItem = document.createElement('div');
          moduleItem.className = 'module-item';

          const moduleTitle = document.createElement('h4');
          moduleTitle.textContent = `${type} 모듈`;

          const moduleImg = document.createElement('img');
          moduleImg.src = url;
          moduleImg.alt = `${type} 모듈`;
          moduleImg.className = 'module-img';
          moduleImg.addEventListener('click', function (event) {
            event.stopPropagation();
            showZoomedImage(event, url);
          });

          moduleItem.appendChild(moduleTitle);
          moduleItem.appendChild(moduleImg);
          moduleGrid.appendChild(moduleItem);
        });

        details.appendChild(moduleGrid);
      }

      header.appendChild(image);
      header.appendChild(info);
      card.appendChild(header);
      card.appendChild(details);

      // 카드 헤더 클릭 시, 다른 카드들은 닫고 해당 카드의 세부 정보를 토글합니다.
      header.addEventListener('click', function () {
        const wasExpanded = details.classList.contains('expanded');
        document.querySelectorAll('.operator-card').forEach(otherCard => {
          otherCard.classList.remove('selected');
          const otherDetails = otherCard.querySelector('.card-details');
          if (otherDetails) {
            otherDetails.classList.remove('expanded');
          }
        });
        if (!wasExpanded) {
          details.classList.add('expanded');
          card.classList.add('selected');
        }
      });

      return card;
    }

    // 모듈 이미지를 클릭하면 확대 이미지를 표시합니다.
    function showZoomedImage(event, imageUrl) {
      event.stopPropagation();
      dom.zoomedImage.src = imageUrl;
      showElement(dom.zoomOverlay);
    }

    // 오퍼레이터 이름으로 검색하여 결과를 표시합니다.
    async function searchOperator() {
      const searchTerm = dom.operatorSearch.value.trim().toLowerCase();
      if (!searchTerm) {
        alert('오퍼레이터 이름을 입력하세요.');
        return;
      }

      try {
        const operatorsData = await fetchData('operators.json');
        const searchResults = operatorsData
          .filter(op => op.name.toLowerCase().includes(searchTerm))
          .sort((a, b) => b.rarity - a.rarity);

        displayOperators(searchResults);

        hideElement(dom.noticeSection);
        hideElement(dom.subclassSelection);
        showElement(dom.operatorList);

        const classButtons = dom.classSelection.querySelectorAll('.fancy-button');
        removeActive(classButtons);
      } catch (error) {
        console.error('검색 중 에러:', error);
        alert('검색 중 오류가 발생했습니다.');
      }
    }
  });
})();

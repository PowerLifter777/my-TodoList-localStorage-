"use strict";

// Находим ДОМ элементы по классам и объявляем переменные.
let inputMassage = document.querySelector('.input_main');
let addButton = document.querySelector('.buttton_massageAdd');
let newMassage = document.querySelector('.list');
let newButtons = document.querySelector('.side_menu');
let clearList = document.querySelector('.button_listClear');
let clearInput = document.querySelector('.button_inputClear');
let inputColor = document.querySelector('.input_color'); 
let backButton = document.querySelector('.button_massageReturn');
let forwardButton = document.querySelector('.button_massageForward');
let clearMemory = document.querySelector('.button_memoryClear'); 

let todoList = [];
let storageState;

// Если локалсторедж содержит память 2-го уровня, при перезагрузке достаем элементы из него. 
// Препятствует потере контекста при перезагрузке страницы. 
if (localStorage.getItem('storage')) {
	storageState = JSON.parse(localStorage.getItem('storage'));
} else {
	storageState = [];
};

// Если локалсторедж не пустой, при перезагрузке достаем элементы из него. Вызываем функцию отрисовки. 
if (localStorage.getItem('storageList')) {
	todoList = JSON.parse(localStorage.getItem('storageList'));
	displayMassages();
};

// При клике на кнопку .buttton_massageAdd создаем новый объект поста и пушим его в массив всех постов.
// Записываем в локалсторедж. Вызываем функцию отрисовки.   
addButton.addEventListener('click', function(){
	let newToDo = {
		todo: inputMassage.value,
		checked: false,
		important: false,				
	};
	todoList.push(newToDo);
	// todoList.forEach((el,i)=> el.id = i);
	localStorage.setItem('storageList', JSON.stringify(todoList));
	primeStorage();
	setCount();
	displayMassages();
});

// Резервное хранилище для реализации переходов "вперед-назад" даже после обновления страницы.
// При любых изменениях на странице в массив добавляется полная копия текущего состояния. Хранилище вмещает 5 состояний. 
function primeStorage() {
	 const deepCloneState = JSON.parse(JSON.stringify(todoList));

	if (storageState.length < 50) {
		storageState.push(deepCloneState);
	
	} else {
		storageState.shift();
		storageState.push(deepCloneState);
	}
	localStorage.setItem('storage', JSON.stringify(storageState)); 
};

// Функция отрисовки элементов списка. 
// При отрисовке поста, так же, аткивируются кнопки переходов "вперед-назад" и очистки листа.
function displayMassages() {
	let displayMassage = '';
	let displayButtons = '';

	if (todoList.length) {
		todoList.forEach((el, i) => {
			displayMassage += `
				<li id='li_${i}' style="background-color: ${el.color}" >
					<input type='checkbox' id='check_${i}' ${el.checked ? 'checked' : ''}>
					<label for='item_${i}'>_${i + 1}_  ${el.todo}</label>
					<hr>
				</li>
			`; 
			displayButtons += `
				<li id='li_${i}'>
					<button class='button_dell' id='item_${i}'>&#10008</button>
					<input type="color" class='input_color' id='color_${i}' value='${el.color ? el.color : '#000000'}'>
					<hr>
				</li>
			`;
			newMassage.innerHTML = displayMassage;
			newButtons.innerHTML = displayButtons;
		})
	
	} else {
		newMassage.innerHTML = '';
		newButtons.innerHTML = '';
	}
	backActivation ();
	forwardActivation ();
	activClearList();
};

// Событие отрисовки и запись в память поля "checked" для каждого пункта списка.
newMassage.addEventListener('change', function(event) {
	const idInput = event.target.getAttribute('id');
	const currentCheck = todoList[idInput.slice(idInput.indexOf('_') + 1)]; 
	// todoList.forEach(function(el,i){
	// 	if (`check_${el.id}` === idInput) {
	// 		el.checked = !el.checked;
	// 		localStorage.setItem('storageList', JSON.stringify(todoList));		
	// 	};
	// });
	currentCheck.checked = !currentCheck.checked;
	localStorage.setItem('storageList', JSON.stringify(todoList));
	setCount();
	primeStorage();
});

// Событие очистки всей памяти. Деактивация всех кнопок на экране и отриовка нового состояния
clearMemory.addEventListener('click', function() {
	// localStorage.setItem('storageList', JSON.stringify([]));
	// localStorage.setItem('storage', JSON.stringify([]));
	count = 0;
	inputMassage.value = '';
	todoList = [];
	storageState = [];
	localStorage.setItem('count', JSON.stringify(count));
	clearList.setAttribute('disabled', true);
	clearMemory.setAttribute('disabled', true);
	clearInput.setAttribute('disabled', true);
	addButton.setAttribute('disabled', true);
	backButton.setAttribute('disabled', true);
	forwardButton.setAttribute('disabled', true);
	localStorage.removeItem('storage');
    localStorage.removeItem('storageList');
	displayMassages();	
});

// Событие очистки списка дел. Заменяем текущее состояние спаска дел пустым массивом, 
// записываем текущее состояние в память 2-го уровня. Отрисовываем пустой список.
clearList.addEventListener('click', function() {
	todoList = [];
	localStorage.setItem('storageList', JSON.stringify(todoList));
	clearList.setAttribute('disabled', true);
	setCount();
	primeStorage();
	displayMassages();
});

// Функция активации кнопки очистки листа. Если массив поста не пустой, 
// то активируется кнопка очистки листа и кнопка очистки всей памяти.
function activClearList() {
	const check = JSON.parse(localStorage.getItem('storageList'));
	
	if (check && check.length) {
		clearList.removeAttribute('disabled'); 
	
	} else {
		clearList.setAttribute('disabled', true);
	};
	
	if (localStorage.getItem('storage')) {
		clearMemory.removeAttribute('disabled');
	
	} else {
		clearMemory.setAttribute('disabled', true);
	};	
};

//При фокусе поля ввода активируется кнопка очистки инпута. 
inputMassage.addEventListener('focus', function() {
	clearInput.removeAttribute('disabled');
});

// Событие очистки инпута и деактивации кнопок очистки и добавления нового поста.
clearInput.addEventListener('click', function() {
	inputMassage.value = '';
	clearInput.setAttribute('disabled', true);
	addButton.setAttribute('disabled', true);
});

// Событие деактивации кнопки добавления нового поста 
// Если в инпуте пусто кнопка ввода не активна. Исключает возможность добавления пустого поста
inputMassage.addEventListener('input', function(e) {
	if (e.target.value.trim()) {
		addButton.removeAttribute('disabled');
	} else {
		addButton.setAttribute('disabled', true);
	}
});

// Событие нажатия на "крестик" бокового меню. 
// Если пост имеет цветовой окрас, то первое нажатие убирает цвет, второе нажатие удаляет пост.
// Если цвет поста не указан, то первое нажатие удаляет пост. Запись в память текущего состояния.
newButtons.addEventListener('click', function(event) {
	const clickId = event.target.getAttribute('id');
	const targetClass = event.target.getAttribute('class');
	// let elemStyle = elem.getAttribute('style');
	// let elemStyle = getComputedStyle(elem).backgroundColor;
	const currentMassage = clickId ? todoList[clickId.slice(clickId.indexOf('_') + 1)] : '' ;

	if (targetClass === "button_dell" && !("color" in currentMassage)) {
		// const clickId = event.target.getAttribute('id');
		todoList.splice(clickId.slice(clickId.indexOf('_') + 1), 1);
		localStorage.setItem('storageList', JSON.stringify(todoList));
		setCount();
		primeStorage();
		displayMassages(); 

	} else if (targetClass === "button_dell") {
		const targetInput = newButtons.querySelector(`#color_${clickId.slice(clickId.indexOf('_') + 1)}`);
		const elem = newMassage.querySelector(`#li_${clickId.slice(clickId.indexOf('_') + 1)}`);
		targetInput.value = '#000000';
		elem.style.backgroundColor = '#e6e6e6';
		// todoList[clickId.slice(clickId.indexOf('_')+1)].color = '#e6e6e6';
		delete todoList[clickId.slice(clickId.indexOf('_') + 1)].color
		localStorage.setItem('storageList', JSON.stringify(todoList));
		setCount();
		primeStorage();
	}
});	

// Событие изменения цвета поста, и запись текущего состояния в память.
newButtons.addEventListener('change', function(event) {
	const targetClass = event.target.getAttribute('class');

	if (targetClass === "input_color") {
		const idInput = event.target.getAttribute('id');
		const elem = newMassage.querySelector(`#li_${idInput.slice(idInput.indexOf('_') + 1)}`);
		elem.style.backgroundColor = event.target.value;
		// todoList.forEach((el,i) => idInput.slice(idInput.indexOf('_')+1) == i? el.color = event.target.value:undefined);
    	todoList[idInput.slice(idInput.indexOf('_') + 1)].color = event.target.value;
		localStorage.setItem('storageList', JSON.stringify(todoList));
		setCount();
		primeStorage();
		displayMassages(); 
	}
});	

// Функция активации кнопки перехода "назад". Если в памяти второго уровня есть данные кнопка активируется. 
function backActivation () {
	
	if (JSON.parse(localStorage.getItem('count')) != 0) {
		backButton.removeAttribute('disabled');
	} else {
		backButton.setAttribute('disabled', true);
	}
};

// Функция активации кнопки перехода "вперед". Если в памяти есть счетчик обратного отсчета, т.е. 
// текущее состояние - не последнее в памяти, то активируется кнопка перехода "вперед".
function forwardActivation () {
	const storageLength = localStorage.getItem('storage') ? JSON.parse(localStorage.getItem('storage')).length : 0;
	const count = JSON.parse(localStorage.getItem('count'));
	
	if (storageLength == 6) {
		if (storageLength - 1 <= count) {
			forwardButton.setAttribute('disabled', true);
		} else {
			forwardButton.removeAttribute('disabled');
		};
	
	} else if (storageLength < 6 && storageLength > 0) {
		if (storageLength <= count) {
			forwardButton.setAttribute('disabled', true);
		} else {
			forwardButton.removeAttribute('disabled');
		};
	} else {
		forwardButton.setAttribute('disabled', true);
	}
};

let count =  localStorage.getItem('count') ? JSON.parse(localStorage.getItem('count')) : 0;
localStorage.setItem('count', JSON.stringify(count));

// Функция создания счетчика обратного отсчета для реализации переходов "вперед-назад"
function setCount() {
	count = !localStorage.getItem('count') ? 0 : count < 5 ? count + 1 : 5;
	localStorage.setItem('count', JSON.stringify(count));
}
	
// Событие перехода "назад". Переход осуществляется по элементам массива памяти 2-го уровня. 
// Увеличивается счетчик обратного отсчета (до 5 шагов), отрисовывается текущее состояние и записывается в память первого уровня.
// Если переходов "назад" больше нет, кнопка перехода деактивируется.
backButton.addEventListener('click', function(){
	const arr = JSON.parse(localStorage.getItem('storage'));

	if (arr.length === 6 && count > 1) {
		count --;
		todoList = [...arr[count]];
		localStorage.setItem('count', JSON.stringify(count));
		forwardButton.removeAttribute('disabled');
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();

	} else if (arr.length < 6 && count > 1) {
		count --;
		todoList = [...arr[count - 1]];
		localStorage.setItem('count', JSON.stringify(count));
		forwardButton.removeAttribute('disabled');
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();
		
	} else if (count == 1 && arr.length === 6){
		count --;
		todoList = [...arr[0]];
		localStorage.setItem('count', JSON.stringify(count));
		forwardButton.removeAttribute('disabled');
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();
	
	} else {
		count --;
		todoList = [];
		forwardButton.removeAttribute('disabled');
		backButton.setAttribute('disabled', true);
		localStorage.setItem('count', JSON.stringify(count));
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();
	};	
});

// Событие перехода "вперед". Переход осуществляется по элементам массива памяти 2-го уровня. 
// Уменьшается счетчик обратного отсчета (до 5 шагов), отрисовывается текущее состояние и записывается в память первого уровня.
// Если переходов "вперед" больше нет, кнопка перехода деактивируется.
forwardButton.addEventListener('click', function(){
	const arr = JSON.parse(localStorage.getItem('storage'));

	if (arr.length - count > 2 && arr.length === 6) {
		todoList = [...arr[count + 1]];
		count ++;
		localStorage.setItem('count', JSON.stringify(count));
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();

	} else if (arr.length - count > 0 && arr.length < 6) {
		todoList = [...arr[count]];
		count ++;
		forwardButton.setAttribute('disabled', true);
		localStorage.setItem('count', JSON.stringify(count));
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();

	} else {
		count ++;
		todoList = [...arr[count]];
		forwardButton.setAttribute('disabled', true);
		localStorage.setItem('count', JSON.stringify(count));
		localStorage.setItem('storageList', JSON.stringify(todoList));
		activClearList();
		displayMassages();
	};
});







// let count =  JSON.parse(localStorage.getItem('count'));

// // Событие перехода "назад". Переход осуществляется по элементам массива памяти 2-го уровня. 
// // Увеличивается счетчик обратного отсчета (до 5 шагов), отрисовывается текущее состояние и записывается в память первого уровня.
// // Если переходов "назад" больше нет, кнопка перехода деактивируется.
// backButton.addEventListener('click', function(){
// 	let arr = JSON.parse(localStorage.getItem('storage'));

// 	if (arr.length - 2 - count > 0 ) {
// 		todoList = [...arr[arr.length - 2 - count]];
// 		count++;
// 		localStorage.setItem('count', JSON.stringify(count));
// 		forwardButton.removeAttribute('disabled');
// 		localStorage.setItem('storageList', JSON.stringify(todoList));
// 		activClearList();
// 		displayMassages();
// 	} else {
// 		todoList = [...arr[arr.length - 2 - count]];
// 		// count++;
// 		forwardButton.removeAttribute('disabled');
// 		backButton.setAttribute('disabled', true);
// 		localStorage.setItem('storageList', JSON.stringify(todoList));
// 		activClearList();
// 		displayMassages();
// 	};
// });

// // Событие перехода "вперед". Переход осуществляется по элементам массива памяти 2-го уровня. 
// // Уменьшается счетчик обратного отсчета (до 5 шагов), отрисовывается текущее состояние и записывается в память первого уровня.
// // Если переходов "вперед" больше нет, кнопка перехода деактивируется.
// forwardButton.addEventListener('click', function(){
// 	let arr = JSON.parse(localStorage.getItem('storage'));

// 	if (arr.length - 1 - count < 5 && arr.length - count < arr.length) {
// 		todoList = [...arr[arr.length - 1 - count]];
// 		count--;
// 		localStorage.setItem('count', JSON.stringify(count));
// 		localStorage.setItem('storageList', JSON.stringify(todoList));
// 		activClearList();
// 		displayMassages();
// 		// console.log(arr.length - 1 - count);
// 		// console.log(arr.length);
// 	} else {
// 		todoList = [...arr[arr.length - 1 - count]];
// 		// count--;
// 		localStorage.removeItem('count');
// 		forwardButton.setAttribute('disabled', true);
// 		localStorage.setItem('storageList', JSON.stringify(todoList));
// 		activClearList();
// 		displayMassages();
// 	};
// });





















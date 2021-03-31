// JavaScript Document

/*==========================================================================
--------------------------    Global Variables   ---------------------------
============================================================================*/

let currentPage = 1; //Starting page
let itemsPerPage = 9;
let pagnationList = document.querySelector('.link-list');
let studentsList = document.querySelector('.student-list');
let header = document.querySelector('.header');
let buttons;
let curentPageData;
let transitionTime = 500; //must match transition time of .position-left and .position-right in styles.css

/*==========================================================================
---------------------------    Student Data   ------------------------------
============================================================================*/

function createStudentHTML(includeLi, student) {
	let HTML;
	let studentDiv = `
		<div>
			<div class="student-details">
				<img class="avatar" src="${student.picture.large}" alt="Profile Picture">
				<h3>${student.name.first} ${student.name.last}</h3>
				<span class="email">${student.email}</span>
			</div>
			<div class="joined-details">
				<span class="date">Joined ${student.registered.date}</span>
			</div>
		</div>`;
	if (includeLi) { //needed when creating a new list (for search or loading page)
		HTML = `
			<li class="student-item cf">
					${studentDiv}
			</li>`;
	} else {
		HTML = studentDiv;
	}
	return HTML;
}

//function to be called on page change
function updateStudentDiv(direction, studentList, studentHTML) {
	//create new list item (Li) if previous Li has been removed from page (when there is less items then itemsPerPage to display)
	if (studentList == undefined) {
		studentList = document.createElement('LI');
		studentList.className = 'student-item cf';
		studentList.innerHTML = studentHTML;
		studentsList.appendChild(studentList);
	}

	let currentStudentDiv = studentList.querySelector('div');

	//remove list item (parent Element) if there is no data to be displayed in div (less items then itemsPerPage to display)
	if (studentHTML == undefined) {
		currentStudentDiv.parentElement.remove();
		return;
	}

	//page transition function
	let newStudentDiv = document.createElement('DIV');
	newStudentDiv.className = `position-${direction}`; //hide new div to right or left
	newStudentDiv.innerHTML = studentHTML;
	studentList.appendChild(newStudentDiv);
	if (direction == 'right') {
		setTimeout(() => newStudentDiv.style.right = '0', 30); //timeout needed to allow transition to occour
	} else {
		setTimeout(() => newStudentDiv.style.left = '0', 30); //timeout needed to allow transition to occour
	}
	setTimeout(() => { //once transition has finished set div's back to normal
		currentStudentDiv.remove();
		newStudentDiv.className = '';
		newStudentDiv.style.right = '';
		newStudentDiv.style.left = '';
	}, (transitionTime + 31));
}

//show first page on load || show page of button clicked
function showpage(list, page, createNewList) {
	let startIndex = (page * itemsPerPage) - itemsPerPage; //first list item to be shown on page
	let endIndex = (page * itemsPerPage - 1); //last list item to be shown on page
	let studentListItems = studentsList.querySelectorAll('li');
	let pageHTML = [];
	for (let i = 0; i < list.length; i++) { //create HTML for each student to be shown
		if (i >= startIndex && i <= endIndex) {
			let studentHTML = createStudentHTML(createNewList, list[i]);
			pageHTML.push(studentHTML);
		}
	}
	if (createNewList) { //on page load and search functionality
		studentsList.innerHTML = pageHTML.join(' ');
		if (list.lenght > 9) {
			document.querySelectorAll('button')[page].className = 'active';
		} //add active class to current page
	} else if (currentPage < page) { //if going down a page/s (new div will come from right)
		for (let i = 0; i < itemsPerPage; i++) {
			updateStudentDiv('right', studentListItems[i], pageHTML[i]);
		}
	} else {
		for (let i = 0; i < itemsPerPage; i++) { //if going up a page/s (new div will come from left)
			updateStudentDiv('left', studentListItems[i], pageHTML[i]);
		}
	}
	currentPage = page;
	curentPageData = list;
}

/*==========================================================================
-----------------------------    Pagnation   -------------------------------
============================================================================*/

function createPagnation(list) {
	let pagnationListItems = [];
	if (list.length >= itemsPerPage) { //only create pagnation buttons if items only fit on more then one page
		for (let i = 0; i < (list.length / itemsPerPage); i++) {
			let button = `
				<li>
					<button type="button">${i + 1}</button>
				</li>`;
			pagnationListItems.push(button);
		}
	}
	pagnationList.innerHTML = pagnationListItems.join(' ');
	buttons = document.querySelectorAll('button'); //update buttons variable to be used in global scope
}

function checkButtonClicked(e) {
	if (e.target.type == 'button' && e.target.className !== 'active') { //only run if unactive button is clicked
		pagnationList.removeEventListener('click', checkButtonClicked, false); //needed to allow tranisiton to finish before next button is clicked
		showpage(curentPageData, (e.target.textContent), false);
		for (let i = 0; i < buttons.length; i++) { //remove active class from all buttons
			buttons[i].className = '';
		}
		e.target.className = 'active';
		setTimeout(() => { //once anitimation has ended re-instate event listener
			pagnationList.addEventListener('click', checkButtonClicked, false);
		}, (transitionTime + 31));
	}
}

/*==========================================================================
------------------------    Search Functionality   --------------------------
============================================================================*/

function createSearch() {
	let label = document.createElement('LABEL');
	label.setAttribute('for', 'search');
	label.className = 'student-search';
	label.innerHTML = `
		<span>Search by name</span>
		<input id="search" placeholder="Search by name..." onkeyup="searchFunction(data)">
		<button type="button"><img src="img/icn-search.svg" alt="Search icon"></button>`;
	header.appendChild(label);
}

function searchFunction(list) {
	// Declare variables
	let input, filter, filteredList, searchCritera;
	input = document.getElementById('search');
	filter = input.value.toUpperCase();
	filteredList = [];
	// Loop through all list items, and add items to filteredList that match search query
	for (let i = 0; i < list.length; i++) {
		searchCritera = list[i].name.first.toUpperCase() + " " + list[i].name.last.toUpperCase();
		if (searchCritera.indexOf(filter) > -1) {
			filteredList.push(list[i]);
		}
	}
	if (input.value.length == 0) { //run when search is finished
		createPagnation(data);
		showpage(data, 1, true);
	} else if (filteredList.length > 0) {
		createPagnation(filteredList); //create new list in DOM with filtered list
		showpage(filteredList, 1, true);
	} else { //run when there are zero matches
		studentsList.innerHTML = `<div style="height:50vh; display:flex;"><h1 class="header" style="font-weight: 700; font-size: 2.5rem; margin: auto; color: #4a5568;">SORRY THERE ARE NO RESULTS</h1></div>`;
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].remove();
		}
	}
}

/*==========================================================================
---------------------------    Initilize Page  -----------------------------
============================================================================*/

createSearch();
createPagnation(data);
showpage(data, currentPage, true);
pagnationList.addEventListener('click', checkButtonClicked, false);
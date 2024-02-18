const SERVER_URL = "http://localhost:3000";

async function serverAddStudent(obj) {
  let response = await fetch(SERVER_URL + "/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });

  let data = await response.json();

  return data;
}

async function serverGetStudents() {
  let response = await fetch(SERVER_URL + "/api/students", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  let data = await response.json();

  return data;
}

async function serverDeleteStudent(id) {
  let response = await fetch(SERVER_URL + "/api/students/" + id, {
    method: "DELETE",
  });

  let data = await response.json();

  return data;
}

let serverData = await serverGetStudents();

let studentsList = [];

if (serverData) {
  studentsList = serverData;
}

function formatDate(date) {
  var dd = date.getDate();
  if (dd < 10) dd = "0" + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  var yy = date.getFullYear();
  if (yy < 10) yy = "0" + yy;

  return dd + "." + mm + "." + yy;
}

const curDate = new Date();

function getAge(birthDate) {
  const checkDate =
    curDate.getMonth() < birthDate.getMonth() ||
    (curDate.getMonth() === birthDate.getMonth() &&
      curDate.getDate() < birthDate.getDate());

  let yearDif = curDate.getFullYear() - birthDate.getFullYear();

  const age = yearDif - checkDate;

  return age;
}

function singPlur(age, labels = ["год", "года", "лет"]) {
  let casesArr = [2, 0, 1, 1, 1, 2];
  return labels[
    age % 100 > 4 && age % 100 < 20 ? 2 : casesArr[age % 10 < 5 ? age % 10 : 5]
  ];
}

function getStudentItem(studentObj) {
  const $tr = document.createElement("tr");
  const $tdFIO = document.createElement("td");
  const $tdBirthday = document.createElement("td");
  const $tdfaculty = document.createElement("td");
  const $tdStudyStart = document.createElement("td");
  const $tdDelete = document.createElement("td");
  const $btnDelete = document.createElement("button");

  $btnDelete.classList.add("btn", "btn-danger", "w-100");
  $btnDelete.textContent = "Удалить";

  let studentAge = getAge(new Date(studentObj.birthday));

  let getStudyYear = (admissionYear) => {
    let year = curDate.getFullYear() - admissionYear;

    return year > 4 ? "закончил" : `${year + 1} курс`;
  };

  $tdFIO.textContent = `${studentObj.surname} ${studentObj.name} ${studentObj.lastname}`;
  $tdBirthday.textContent = `${formatDate(
    new Date(studentObj.birthday)
  )} (${studentAge} ${singPlur(studentAge)})`;
  $tdfaculty.textContent = studentObj.faculty;
  $tdStudyStart.textContent = `${studentObj.studyStart}-${
    Number(studentObj.studyStart) + 4
  } (${getStudyYear(studentObj.studyStart)})`;

  $btnDelete.addEventListener("click", async function () {
    await serverDeleteStudent(studentObj.id);
    $tr.remove();
  });

  $tdDelete.append($btnDelete);
  $tr.append($tdFIO, $tdBirthday, $tdfaculty, $tdStudyStart, $tdDelete);
  return $tr;
}

function renderStudentsTable(studentsArray) {
  let copyArr = [...studentsArray];

  for (const obj of copyArr) {
    obj.fio = `${obj.surname} ${obj.name} ${obj.lastname}`;
    obj.graduation = obj.studyStart + 4;
  }

  const $studTable = document.getElementById("stud-table");

  $studTable.innerHTML = "";

  const fioVal = document.getElementById("filter-FIO").value,
    facVal = document.getElementById("filter-faculty").value,
    admVal = document.getElementById("filter-adm").value,
    gradVal = document.getElementById("filter-grad").value;

  if (fioVal !== "") copyArr = filter(copyArr, "fio", fioVal);
  if (facVal !== "") copyArr = filter(copyArr, "faculty", facVal);
  if (admVal !== "") copyArr = filter(copyArr, "studyStart", admVal);
  if (gradVal !== "") copyArr = filter(copyArr, "graduation", gradVal);

  for (const studentObj of copyArr) {
    const $newTr = getStudentItem(studentObj);
    $studTable.append($newTr);
  }
}

renderStudentsTable(studentsList);

function validation(form) {
  function removeError(input) {
    const parent = input.parentNode;

    if (parent.classList.contains("error")) {
      parent.querySelector(".error-label").remove();
      parent.classList.remove("error");
    }
  }

  function createError(input, text) {
    const parent = input.parentNode;
    const errorLabel = document.createElement("label");

    errorLabel.classList.add("error-label");
    errorLabel.textContent = text;

    parent.classList.add("error");

    parent.append(errorLabel);
  }

  let result = true;

  const allInputs = form.querySelectorAll("input");

  for (const input of allInputs) {
    removeError(input);

    if (input.dataset.birthYear) {
      if (
        new Date(input.value) < input.dataset.birthYear ||
        new Date(input.value) > curDate
      ) {
        removeError(input);
        createError(
          input,
          `Допустимое значение: ${input.dataset.birthYear} - ${formatDate(
            curDate
          )}`
        );
        result = false;
      }
    }

    if (input.dataset.admYear) {
      if (
        new Date(input.value) < input.dataset.admYear ||
        new Date(input.value) > curDate
      ) {
        removeError(input);
        createError(
          input,
          `Допустимое значение: ${
            input.dataset.admYear
          } - ${curDate.getFullYear()}`
        );
        result = false;
      }
    }

    if (input.dataset.minLength) {
      if (input.value.length < input.dataset.minLength) {
        removeError(input);
        createError(
          input,
          `Минимальное кол-во символов: ${input.dataset.minLength}`
        );
        result = false;
      }
    }

    if (input.dataset.maxLength) {
      if (input.value.length > input.dataset.maxLength) {
        removeError(input);
        createError(
          input,
          `Максимальное кол-во символов: ${input.dataset.maxLength}`
        );
        result = false;
      }
    }

    if (input.dataset.required === "true") {
      if (input.value.trim() === "") {
        removeError(input);
        createError(input, "Поле не заполнено!");
        result = false;
      }
    }
  }

  return result;
}

document
  .getElementById("add-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (validation(document.getElementById("add-form"))) {
      let newStudentObj = {
        name: document.getElementById("name-inp").value,
        lastname: document.getElementById("lastname-inp").value,
        surname: document.getElementById("surname-inp").value,
        birthday: new Date(document.getElementById("birthday-inp").value),
        faculty: document.getElementById("faculty-inp").value,
        studyStart: document.getElementById("studyStart-inp").value,
      };

      let serverDataObj = await serverAddStudent(newStudentObj);

      serverDataObj.birthday = new Date(serverDataObj.birthday);

      studentsList.push(serverDataObj);

      renderStudentsTable(studentsList);
    }
  });

const colHeaders = document.getElementById("headers"),
  colFIO = document.getElementById("FIO-header"),
  colBirth = document.getElementById("birth-header"),
  colAdm = document.getElementById("adm-header"),
  colFac = document.getElementById("fac-header");

colHeaders.style.cursor = "pointer";

const sortStudents = (arr, prop, dir = false) =>
  arr.sort((a, b) => ((!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 0));

let dirFlag = true;

function sortByClick(elem, prop) {
  elem.addEventListener("click", () => {
    dirFlag = !dirFlag;

    sortStudents(studentsList, prop, dirFlag);
    renderStudentsTable(studentsList);
  });
}

sortByClick(colFIO, "surname");
sortByClick(colBirth, "birthday");
sortByClick(colFac, "faculty");
sortByClick(colAdm, "studyStart");

function filter(arr, prop, value) {
  let resultArr = [],
    copyArr = [...arr];

  for (const i of copyArr) {
    let lowCase = String(i[prop]).toLowerCase();

    if (lowCase.includes(value.toLowerCase())) resultArr.push(i);
  }

  return resultArr;
}

document
  .getElementById("filter-form")
  .addEventListener("keypress", function (event) {
    renderStudentsTable(studentsList);
  });

document
  .getElementById("filter-form")
  .addEventListener("paste", function (event) {
    renderStudentsTable(studentsList);
  });

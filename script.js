// LOGIN
const formLoginUsername = document.querySelector('.login-form__username');
const formLoginPassword = document.querySelector('.login-form__password');
const formLoginSubmit = document.querySelector('.login-form__submit');
const formLoginError = document.querySelector('.login-message');
if (formLoginUsername && formLoginPassword && formLoginSubmit) {
  formLoginUsername.addEventListener('input', function() {
    formLoginError.innerText = '';
    formLoginError.classList.remove('error');
    if (formLoginUsername.value != '' && formLoginPassword.value != '') {
      formLoginSubmit.removeAttribute('disabled', false);
    } else {
      formLoginSubmit.setAttribute('disabled', true);
    }
  });
  formLoginPassword.addEventListener('input', function() {
    formLoginError.innerText = '';
    formLoginError.classList.remove('error');
    if (formLoginUsername.value != '' && formLoginPassword.value != '') {
      formLoginSubmit.removeAttribute('disabled');
    } else {
      formLoginSubmit.setAttribute('disabled', true);
    }
  });
}


//// ROUTE LOADER
// Drop handler function to get all files
async function getAllFileEntries(dataTransferItemList) {
  let fileEntries = [];
  // Use BFS to traverse entire directory/file structure
  let logFiles = []
  for (let i = 0; i < dataTransferItemList.length; i++) {
    fileEntries.push(dataTransferItemList[i].webkitGetAsEntry());
  }
  for (let i = 0; i < fileEntries.length; i++) { 
    const entry = fileEntries[i];
    if (entry.isDirectory) {
      let contents = await readEntriesPromise(entry.createReader());
      for (let j = 0; j < contents.length; j++) {
        if(contents[j].fullPath.endsWith('.log')) {
          logFiles.push(contents[j])
        }
      }
    }
    else if (entry.isFile) {
      if (entry.fullPath.endsWith('.log')) {
        logFiles.push(entry);
      }
    }    
  }
  return logFiles;
}

// Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Wrap readEntries in a promise to make working with readEntries easier
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

const dropArea = document.querySelector('.log-loader__drop-area');
const dropAreaLabel = document.querySelector('.log-loader__drop-area--label');
const logList = document.querySelector('.log-loader__logs-list');
const fileNames = [];
const filePaths = [];
const fileData = [];

if (dropArea) {
  dropArea.addEventListener('dragover', function (event) {
      event.preventDefault();
  });
}

if (dropArea) {
  dropArea.addEventListener('drop', async function (event) {
    // spinner start
    const readFile = async (filePromise) => {
      const fileReader = new FileReader();
      return new Promise(async (resolve, reject) => {
        fileReader.onload = function() {
          resolve(fileReader.result);
        }
        fileReader.readAsText(await filePromise);
      })
    };
    event.preventDefault();
    let items = await getAllFileEntries(event.dataTransfer.items);
    let fileContent = [];
    items.forEach((entry) => {
      filePromise = new Promise((resolve, reject) => { entry.file(resolve, reject); });
      fileContent.push(readFile(filePromise));
      fileNames.push(entry.name);
      filePaths.push(entry.fullPath);
    });
    for (let i = 0; i < fileContent.length; i++) {
      currentLog = await fileContent[i];
      fileData.push(currentLog);
    }
    // spinner stop
    dropAreaLabel.parentNode.removeChild(dropAreaLabel);
    this.classList.toggle('animate-height');
    const templateBtn = document.querySelector('.log-loader__template');
    templateBtn.removeAttribute('disabled');
  });

  function getTemplate() {
    let selectedDb = document.querySelector('.log-loader__template').value;
    if (selectedDb) {
      fetch('fetch-template.php?db=' + selectedDb)
        .then(function(res) {
          return res.json();
        })
        .then(function(data) {
          processTemplate(data);
        })
        .catch(function(err) {
          console.log(err);
        });
    } else {
      routesTable = document.querySelector('.routes-table');
      if (routesTable) routesTable.innerHTML = '';
    }
  }
}

function processTemplate(tplData) {
  // clear old route table if present
  routesTable = document.querySelector('.routes-table');
  if (routesTable) routesTable.innerHTML = '';
  const numberOfLogs = fileNames.length;
  for (let i = 0; i < numberOfLogs; i++) {
    let routeHeader = fileData[i].split('\n')[0];
    let routeRows = [];
    if (routeHeader[0] === '#') {
      routeName = routeHeader.substr( 1, routeHeader.indexOf(' ') ).trim();
    } else {
      routeName = fileNames[i].substr( 0, fileNames[i].indexOf('.') ).trim();
    }
    // split header with underscores
    routeNameSegments = routeName.split('_'); 
    // read route data
    let lines = fileData[i].split('\n');   
    for (let j = 0; j < lines.length; j++) {
      // if header exists skip it, we have already read it
      if (lines[j][0] === '#') continue;
      lineSegments = trimArray(lines[j].trim().split('\t'));
      routeRows.push(lineSegments);
    }
    // transpose rows to columns
    routeColumns = routeRows[0].map((col, i) => routeRows.map(row => row[i]));
    // create DOM elements
    routesTable = document.querySelector('.routes-table');
    if (routesTable) {
      routeNameElement = document.createElement('H4');
      routeNameElement.className = 'routes-table__name';
      routeNameElement.innerText = routeName;
      routesTable.appendChild(routeNameElement);
      routeBox = document.createElement('DIV');
      routeBox.className = 'routes-table__box';
      routesTable.appendChild(routeBox);
      // numberOfColumns = Object.keys(tplData).length;
      // create route table
      for (let colName in tplData) {
        if (tplData.hasOwnProperty(colName)) {
          routeColumn = document.createElement('UL');
          routeColumn.className = 'routes-table__column';
          routeColumnLabel = document.createElement('LI');
          routeColumnLabel.className = 'routes-table__column--label';
          routeColumnDataArray = [];
          routeColumnLabel.innerText = colName;
          routeColumn.appendChild(routeColumnLabel);
          // distribute columns
          if (tplData[colName].includes('column_')) {
            colIndex = tplData[colName].replace('column_', '');
            // check if template columns is valid for this route
            if (routeColumns[colIndex] != 'undefined') {
              routeColumnDataArray = routeColumns[colIndex];
            }
          } else if (tplData[colName].includes('header_')) {
            hIndex = tplData[colName].replace('header_', '');
            // check if template header is valid for the route
            if (routeNameSegments[hIndex] != 'undefined') {
              let headerArr = [];
              for (let l = 0; l < routeRows.length; l++) {
                headerArr.push(routeNameSegments[hIndex]);
              }     
              routeColumnDataArray = headerArr;
            }
          } else if (tplData[colName] === 'header') {
            let headerArr = [];
            for (let m = 0; m < routeRows.length; m++) {
              headerArr.push(routeName);
            }
            routeColumnDataArray = headerArr;
          } else {
            let customArr = [];
            for (let n = 0; n < routeRows.length; n++) {
              customArr.push(tplData[colName]);
            }
            routeColumnDataArray = customArr;
          }
          //console.log(routeColumnDataArray);
          if (Array.isArray(routeColumnDataArray) && (typeof routeColumnDataArray[0] != 'undefined') ) {
            for (let p = 0; p < routeColumnDataArray.length; p++) {
              routeColumnData = document.createElement('LI');
              routeColumnData.className = 'routes-table__column--data';
              routeColumnData.innerText = routeColumnDataArray[p];
              routeColumn.appendChild(routeColumnData);
            }
          } else {
            routeColumnData = document.createElement('LI');
            routeColumnData.className = 'routes-table__column--data';
            routeColumnData.innerText = 'invalid';
            routeColumnData.classList.add('invalid');
            routeColumn.appendChild(routeColumnData);
            routeNameElement.classList.add('color_error');
          }
          routeBox.appendChild(routeColumn);       
        }      
      }
    }
  }

  const routeNameEls = document.querySelectorAll('.routes-table__name');
  for (let a = 0; a < routeNameEls.length; a++) {
    routeNameEls[a].addEventListener('click', function(e) {
      if (e.target.nextSibling.classList.contains('expand')) {
        e.target.nextSibling.classList.remove('expand');
      } else {
        e.target.nextSibling.classList.add('expand');
      }
    });
  }
  for (let b = 0; b < routeNameEls.length; b++) {
    if (routeNameEls[b].classList.contains('color_error')) {
      document.querySelector('.save-routes__btn').setAttribute('disabled', 'true');
      break;
    } else {
      document.querySelector('.save-routes__btn').removeAttribute('disabled');
    } 
  }
}

function trimArray(arr) {
  let trimmed = [];
  for (let i = 0; i < arr.length; i++) {
    trimmed.push(arr[i].trim());
  }
  return trimmed;
}

const loadRoutesBtn = document.querySelector('.save-routes__btn');
if (loadRoutesBtn) {
  loadRoutesBtn.addEventListener('click', function() {
    const templateName = document.querySelector('.log-loader__template').value;
    const postRoutes = document.getElementsByClassName('routes-table__name');
    const routesNames = [];
    const postAll = [];
    for (let i = 0; i < postRoutes.length; i++) {
      let currentRouteColumns = postRoutes[i].nextSibling.children;
      let rowsInRoute = currentRouteColumns[0].children.length;
      let postData = [];
      for (let k = 0; k < rowsInRoute; k++) {
        let postRowData = [];
        for (let j = 0; j < currentRouteColumns.length; j++) {
          let currentRouteRecords = currentRouteColumns[j].children;
          postRowData.push(currentRouteRecords[k].innerText);
        }
        postData.push(postRowData);
      }
      postAll.push(postData);
      routesNames.push(postRoutes[i].innerText);
    }
    loadRoutes(templateName, postAll, routesNames);
  });
}

function loadRoutes(template, allRoutesData, routesNames) {
  const formData = new FormData();
  formData.append('template', template)
  formData.append('data', JSON.stringify(allRoutesData));
  formData.append('names', routesNames.join(','));
  fetch('fetch-routes.php', {
      method: 'post',
      body: formData
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(message) {
      if (message.success) {
        displaySuccessMessage(message.success);
      } else {
        displayErrorMessage(message.error);
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function displaySuccessMessage(text) {
  document.querySelector('.log-loader__template').style.display = 'none';
  document.querySelector('.routes-table').style.display = 'none';
  document.querySelector('.save-routes__btn').style.display = 'none';
  messageSuccess = document.createElement('H4');
  messageSuccess.innerText = text;
  messageSuccess.classList.add('success');
  document.querySelector('.log-container').style.backgroundColor = '#43A047';
  document.querySelector('.log-loader').appendChild(messageSuccess);
}

function displayErrorMessage(text) {
  if (document.querySelector('.error--cancel')) {
    messageError.parentNode.removeChild(messageError);
  }
  messageError = document.createElement('H4');
  messageError.innerText = text;
  messageError.classList.add('error--cancel');
  document.querySelector('.log-loader').parentNode.appendChild(messageError);
  messageError.addEventListener('click', function() {
    messageError.parentNode.removeChild(messageError);
  })
}


// TEMPLATE CREATOR
const templateDropArea = document.querySelector('.template-loader__drop-area');
const templateDropAreaLabel = document.querySelector('.template-loader__drop-area--label');
const tplRouteData = [];
const tplFileNames = [];

if (templateDropArea) {
  templateDropArea.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
}

if (templateDropArea) {
  templateDropArea.addEventListener('drop', async function (event) {
    const readFile = async (filePromise) => {
      const fileReader = new FileReader();
      return new Promise(async (resolve, reject) => {
        fileReader.onload = function() {
          resolve(fileReader.result);
        }
        fileReader.readAsText(await filePromise);
      })
    };
    event.preventDefault();
    let items = await getAllFileEntries(event.dataTransfer.items);
    let fileContent = [];
    items.forEach((entry) => {
      filePromise = new Promise((resolve, reject) => { entry.file(resolve, reject); });
      fileContent.push(readFile(filePromise));
      tplFileNames.push(entry.name);
    });
    for (let i = 0; i < fileContent.length; i++) {
      currentLog = await fileContent[i];
      tplRouteData.push(currentLog);
    }
    //console.log(routeData);  
    templateDropAreaLabel.parentNode.removeChild(templateDropAreaLabel);
    this.classList.toggle('animate-height');
    const databaseSelector = document.querySelector('.template-loader__database');
    databaseSelector.removeAttribute('disabled');
  });

  function getData() {
    let databaseSelector = document.querySelector('.template-loader__database').value;
    if (databaseSelector) {
      fetch('fetch-database.php?db=' + databaseSelector)
        .then(function(res) {
          return res.json();
        })
        .then(function(data) {
          renderRoute(data);
        })
        .catch(function(err) {
          console.log(err);
        });
    } else {
      templateTable = document.querySelector('.r.template-table');
      if (templateTable) templateTable.innerHTML = '';
    }
  }
}

function renderRoute(dbData) {
  let routeHeader = tplRouteData[0].split('\n')[0];
  let routeRows = [];
  let routeColumns = [];
  if (routeHeader[0] === '#') {
    routeName = routeHeader.substr( 1, routeHeader.indexOf(' ') ).trim();
  } else {
    routeName = tplFileNames[0].substr( 0, tplFileNames[0].indexOf('.') ).trim();
  }
  // split header with underscores
  let routeNameSegments = routeName.split('_');
  // read route data
  let lines = tplRouteData[0].split('\n');
  for (let j = 0; j < lines.length; j++) {
    // if header exists skip it, we have already read it
    if (lines[j][0] === '#') continue;
    lineSegments = trimArray(lines[j].trim().split('\t'));
    routeRows.push(lineSegments);   
  }
  // transpose rows to columns
  routeColumns = routeRows[0].map((col, i) => routeRows.map(row => row[i]));
  templateTable = document.querySelector('.template-table');
  if (templateTable) {
    templateRenderBox = document.createElement('DIV');
    templateRenderBox.className = 'template-table__render-box';
    templateTable.appendChild(templateRenderBox);
    templateSelectBox = document.createElement('DIV');
    templateSelectBox.className = 'template-table__select-box';
    templateTable.appendChild(templateSelectBox);
    // create render box
    for (let dbColumn of dbData) {
      templateRenderBoxColumn = document.createElement('DIV');
      templateRenderBoxColumn.className = 'template-table__render-box-col';
      templateRenderBoxColumn.id = dbColumn.Field.toLowerCase();
      templateRenderBoxColumn.setAttribute('data-null', dbColumn.Null.toLowerCase());
      templateRenderBoxColumn.setAttribute('data-type', dbColumn.Type.toLowerCase());
      templateRenderBoxColumn.innerHTML = `
        <p>${dbColumn.Field}</p>
        <div class="empty" 
          ondrop="dropHandler(event);" 
          ondragover="dragoverHandler(event);"
          ondblclick="dblclickHandler(event);"></div>`;
      templateRenderBox.appendChild(templateRenderBoxColumn);
    }
    // create selection box
    // - get header info
    for (let segmentIndex = 0; segmentIndex < routeNameSegments.length; segmentIndex++) {
      let routeHeaderColumn = document.createElement('UL');
      routeHeaderColumn.setAttribute('data-title', `header_${segmentIndex}`);
      routeHeaderColumn.id = Math.random().toString(36).substring(7);
      routeHeaderColumn.setAttribute('draggable', 'true');
      routeHeaderColumn.setAttribute('ondragstart', 'dragstartHandler(event)');
      routeHeaderColumn.setAttribute('ondblclick', 'dblclickCloneHandler(event)');
      for (let elementIndex = 0; elementIndex < routeColumns[0].length; elementIndex++) {
        let routeHeaderColumnItem = document.createElement('LI');
        routeHeaderColumnItem.className = 'template-table__select-box-column-item';
        routeHeaderColumnItem.innerText = routeNameSegments[segmentIndex];
        routeHeaderColumn.appendChild(routeHeaderColumnItem);
      }
      templateSelectBox.appendChild(routeHeaderColumn);
    }
    let routeFullHeaderColumn = document.createElement('UL');
    routeFullHeaderColumn.setAttribute('data-title', 'header');
    routeFullHeaderColumn.id = Math.random().toString(36).substring(7);
    routeFullHeaderColumn.setAttribute('draggable', 'true');
    routeFullHeaderColumn.setAttribute('ondragstart', 'dragstartHandler(event)');
    routeFullHeaderColumn.setAttribute('ondblclick', 'dblclickCloneHandler(event)');
    for (let elementIndex = 0; elementIndex < routeColumns[0].length; elementIndex++) {
      let routeFullHeaderColumnItem = document.createElement('LI');
      routeFullHeaderColumnItem.className = 'template-table__select-box-column-item';
      routeFullHeaderColumnItem.innerText = routeName;
      routeFullHeaderColumn.appendChild(routeFullHeaderColumnItem);
    }
    templateSelectBox.appendChild(routeFullHeaderColumn);
    // - get route columns
    for (let columnIndex = 0; columnIndex < routeColumns.length; columnIndex++) {
      let routeColumn = document.createElement('UL');
      routeColumn.setAttribute('data-title', `column_${columnIndex}`);
      routeColumn.id = Math.random().toString(36).substring(7);
      routeColumn.setAttribute('draggable', 'true');
      routeColumn.setAttribute('ondragstart', 'dragstartHandler(event)');
      routeColumn.setAttribute('ondblclick', 'dblclickCloneHandler(event)');
      for (let itemIndex = 0; itemIndex < routeColumns[columnIndex].length; itemIndex++) {
        let routeColumnItem = document.createElement('LI');
        routeColumnItem.className = 'template-table__select-box-column-item';
        routeColumnItem.innerText = routeColumns[columnIndex][itemIndex];
        routeColumn.appendChild(routeColumnItem);
      }
      templateSelectBox.appendChild(routeColumn);
    }
    trashSection = document.createElement('DIV');
    trashSection.className = 'template-table__select-box-trash';
    trashSection.setAttribute('ondrop','dropTrashHandler(event);');
    trashSection.setAttribute('ondragover','dragoverHandler(event);');
    trashSection.setAttribute('ondragenter','dragenterTrashHandler(event);');
    trashSection.setAttribute('ondragleave','dragleaveTrashHandler(event);');
    trashSection.innerText = 'trash';
    templateSelectBox.appendChild(trashSection);

    const saveTemplateBtn = document.querySelector('.save-template__btn');
    saveTemplateBtn.removeAttribute('disabled');
  }
}

function dragstartHandler(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

function dropHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.firstChild == null) {
    let data = e.dataTransfer.getData("text/plain");
    e.target.appendChild(document.getElementById(data));
    e.target.parentNode.classList.remove('error-bg');
    e.target.parentNode.removeAttribute('title');
  }
}

function dragoverHandler(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
 }

function dblclickHandler(e) {
  if (e.target.firstChild == null) {
    e.target.innerHTML = `<input type="text" 
    id="${Math.random().toString(36).substring(7)}" 
    draggable="true" 
    ondragstart="dragstartHandler(event)" 
    onkeypress="inputKeypressHandler(event)" />`;
    e.target.querySelector('input').focus();
  }
}

function inputKeypressHandler(e) {
  if (e.keyCode === 13) {
    e.target.blur();
  }
}

function dblclickCloneHandler(e) {
  const trashBin = document.querySelector('.template-table__select-box-trash');
  const selectBox = document.querySelector('.template-table__select-box');
  const clone = selectBox.insertBefore(e.target.parentNode.cloneNode(true), trashBin);
  clone.id = Math.random().toString(36).substring(7);
}

function dragenterTrashHandler(e) {
  e.target.style.backgroundColor = '#ffcccc';
}

function dragleaveTrashHandler(e) {
  e.target.style.backgroundColor = '#ffffff';
}

function dropTrashHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  let data = e.dataTransfer.getData("text/plain");
  document.getElementById(data).parentNode.removeChild(document.getElementById(data));
  e.target.style.backgroundColor = '#ffffff';
}

function removeInput(e) {
  e.target.parentNode.innerHTML = '';
}

const saveTemplateBtn = document.querySelector('.save-template__btn');
if (saveTemplateBtn) {
  saveTemplateBtn.addEventListener('click', function() {
    const databaseFields = document.querySelectorAll('.template-table__render-box-col');
    const template = {};
    let error = '';
    for (let fieldIndex = 0; fieldIndex < databaseFields.length; fieldIndex++) {
      //console.log(databaseFields[fieldIndex]);
      
      // check if not null and is not empty
      let isNullAllowed = databaseFields[fieldIndex].dataset.null;
      let isRouteColumnPresent = databaseFields[fieldIndex].querySelector('.empty').children.length;
      
      if (isNullAllowed === 'no' && isRouteColumnPresent == 0) { // required but not present
        error = 'column(s) must be filled';
        databaseFields[fieldIndex].setAttribute('title', 'cannot be null');
        databaseFields[fieldIndex].classList.add('error-bg');
      } else { // required and present or not required
        let templateKey = databaseFields[fieldIndex].id;
        let templateValue = '';
        // check if custom field
        if (databaseFields[fieldIndex].querySelector('input')) {
          templateValue = databaseFields[fieldIndex].querySelector('input').value;
        } else if (isRouteColumnPresent == 0) {
          templateValue = '';
        } else {
          templateValue = databaseFields[fieldIndex].querySelector('.empty').firstChild.dataset.title;
        }

        template[templateKey] = templateValue;
        
        // check if datatype is appropriate
      }
      
    }
    if (error != '') {
      if (document.querySelector('.error-modal')) {
        document.querySelector('.error-modal').parentNode.removeChild(document.querySelector('.error-modal'));
      } 
      let errorMessage = document.createElement('DIV');
      errorMessage.className = 'error-modal';
      errorMessage.setAttribute('onclick', 'removeErrorMessage(event)');
      errorMessage.innerText = error;
      document.body.appendChild(errorMessage);
    } else {
      const templateContainer = document.querySelector('.template-container');
      templateContainer.style.opacity = 0.05;
      const templateNameInputMessage = document.createElement('DIV');
      templateNameInputMessage.className = 'template-name-modal';
      templateNameInputMessage.innerHTML = `
      <button class="btn-cancel" onclick="cancelBtnHandler(event)"></button>
      <label class="template-name-modal__label">enter template name</label>
      <input class="template-name-modal__input" type="text" />
      <p class="template-name-modal__message"></p>
      <button class="template-name-modal__btn" disabled="true">save</button>`;
      document.body.appendChild(templateNameInputMessage);
      // get list of template names
      fetch('fetch-template-names.php')
        .then(function(res) {
          return res.text();
        })
        .then(function(text) {
          nameTemplate(text, template);
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  })
}

function removeErrorMessage(e) {
  e.target.parentNode.removeChild(e.target);
}

function cancelBtnHandler(e) {
  const templateContainer = document.querySelector('.template-container');
  templateContainer.style.opacity = 1;
  const templateNameInputMessage = document.querySelector('.template-name-modal');
  templateNameInputMessage.parentNode.removeChild(templateNameInputMessage);
}

function nameTemplate(names, template) {
  inputTemplateName = document.querySelector('.template-name-modal__input');
  saveBtn = document.querySelector('.template-name-modal__btn');
  if (inputTemplateName) {
    inputTemplateName.addEventListener('input', function() {
      if (inputTemplateName.value.length > 2) { // template name should not have fewer than 3 letters
        saveBtn.removeAttribute('disabled');
      } else {
        saveBtn.setAttribute('disabled', 'true');
      }
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const userInput = inputTemplateName.value.trim();
      const templateNames = names.split(',');
      if (templateNames.includes(userInput)) {
        const message = document.querySelector('.template-name-modal__message');
        message.innerHTML = 'template with the same name exists. Overwrite it?';
        saveBtn.innerHTML = 'overwrite';
        inputTemplateName.addEventListener('input', function() {
          message.innerHTML = '';
          saveBtn.innerHTML = 'save';
        });
        saveBtn.addEventListener('click', function() {
          saveTemplate(userInput, template);
        });
      } else {
        saveTemplate(userInput, template);
      }
    });
  }
}

function saveTemplate(name, template) {
  const db = document.querySelector('.template-loader__database').value;
  const signed = document.querySelector('.template-table').dataset.signed;
  const formData = new FormData();
  formData.append('name', name);
  formData.append('signed', signed);
  formData.append('db', db);
  formData.append('template', JSON.stringify(template));
  fetch('fetch-template-save.php', {
      method: 'post',
      body: formData
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(message) {
      if (message.success) {
        templateSuccessMessage(message.success);
      } else {
        templateErrorMessage(message.error);
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function templateSuccessMessage(text) {
  document.querySelector('.template-name-modal').parentNode.removeChild(document.querySelector('.template-name-modal'));
  document.querySelector('.template-container').style.opacity = 1;
  document.querySelector('.template-loader__database').style.display = 'none';
  document.querySelector('.template-table').style.display = 'none';
  document.querySelector('.save-template__btn').style.display = 'none';
  messageSuccess = document.createElement('H4');
  messageSuccess.innerText = text;
  messageSuccess.classList.add('success');
  document.querySelector('.template-container').style.backgroundColor = '#43A047';
  document.querySelector('.template-loader').appendChild(messageSuccess);
}

function templateErrorMessage(text) {
  document.querySelector('.template-name-modal').parentNode.removeChild(document.querySelector('.template-name-modal'));
  document.querySelector('.template-container').style.opacity = 1;
  document.querySelector('.template-loader__database').style.display = 'none';
  document.querySelector('.template-table').style.display = 'none';
  document.querySelector('.save-template__btn').style.display = 'none';
  if (document.querySelector('.error--cancel')) {
    messageError.parentNode.removeChild(messageError);
  }
  messageError = document.createElement('H4');
  messageError.innerText = text;
  messageError.classList.add('error--cancel');
  document.querySelector('.template-loader').parentNode.appendChild(messageError);
  messageError.addEventListener('click', function() {
    messageError.parentNode.removeChild(messageError);
  })
}

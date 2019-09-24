let SITE_DATA;
let ACTIVE_SITE_ID;

const debug = (msg) => {
  console.log(`css-override-web-extension: ${msg}`);
};

const eraseAll = () => {
  browser.storage.sync.clear()
};

const getStorageData = () => {
  return browser.storage.sync.get();
};

const editSiteStyles = () => {
  const txtAreaStyle = document.getElementById('styleData');

  const siteStyles = SITE_DATA[ACTIVE_SITE_ID].style;
  txtAreaStyle.value = siteStyles || '';
  const headingSiteName = document.getElementById('siteName');
  headingSiteName.innerHTML = `Editing: ${ACTIVE_SITE_ID}`;

  // Hide site list & show editor
  const editorArea = document.getElementById('editorArea');
  editorArea.classList.remove('hide');
  const listArea = document.getElementById('listArea');
  listArea.classList.add('hide');
};

const listEventEditSiteStyles = function() {
  ACTIVE_SITE_ID = this.id;
  editSiteStyles();
};

const setStorageData = (obj) => {
  return browser.storage.sync.set(obj).then(() => true, () => false);
}

const btnEventSaveStyles = async function() {
  const style = document.getElementById('styleData').value;
  // const parsedStyle = JSON.stringify(style).replace(/\\n/g, '');
  const parsedStyle = style.trim();

  let obj = {};
  obj[ACTIVE_SITE_ID] = {...SITE_DATA[ACTIVE_SITE_ID]};
  obj[ACTIVE_SITE_ID].style = parsedStyle;
  await setStorageData(obj);

  browser.runtime.sendMessage({
    action: 'updateStyle',
    tabUrl: ACTIVE_SITE_ID,
  }).then((message) => {

  });
};

const btnEventDoneEditing = () => {
  const editorArea = document.getElementById('editorArea');
  editorArea.classList.add('hide');
  const listArea = document.getElementById('listArea');
  listArea.classList.remove('hide');
}

const btnEventClearTextArea = () => {
  document.getElementById('styleData').value = '';
};

const initializePage = () => {
  // Hide editor area
  const editorArea = document.getElementById('editorArea');
  editorArea.classList.add('hide');

  btnEventClearTextArea();

  // Reset site list
  const listArea = document.getElementById('listArea');
  let ulSiteList = document.getElementById('siteList');
  if (ulSiteList) {
    listArea.removeChild(ulSiteList);
  }

  // Build site list
  const ul = document.createElement('ul');
  ul.setAttribute('id', 'siteList');
  listArea.appendChild(ul);

  getStorageData().then(storageData => {
    debug(JSON.stringify(storageData));
    SITE_DATA = storageData;

    ulSiteList = document.getElementById('siteList');
    Object.keys(SITE_DATA).forEach(site => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(site));
      li.setAttribute('id', site);
      ulSiteList.appendChild(li);
      li.addEventListener('click', listEventEditSiteStyles);
    });

    const params = new URLSearchParams(document.location.search.substring(1));
    const siteIdQP = params.get('siteId');
    if (siteIdQP) {
      ACTIVE_SITE_ID = siteIdQP;
      editSiteStyles();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // TODO: Remove this
  const btnClearStorage = document.getElementById('btnClearStorage');
  btnClearStorage.addEventListener('click', eraseAll);

  const btnClear = document.getElementById('btnClear');
  btnClear.addEventListener('click', btnEventClearTextArea);
  const btnSave = document.getElementById('btnSave');
  btnSave.addEventListener('click', btnEventSaveStyles);
  const btnDone = document.getElementById('btnDone');
  btnDone.addEventListener('click', btnEventDoneEditing);
  initializePage();
});

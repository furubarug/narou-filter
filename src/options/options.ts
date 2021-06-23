import {Options, Settings} from '../scripts/Settings';

function getNgUser(): HTMLInputElement {
  return document.querySelector('#ngUser') as HTMLInputElement;
}

function getNgCode(): HTMLInputElement {
  return document.querySelector('#ngCode') as HTMLInputElement;
}

function getNgKeyword(): HTMLInputElement {
  return document.querySelector('#ngKeyword') as HTMLInputElement;
}

function getUseCustom(): HTMLInputElement {
  return document.querySelector('#useCustom') as HTMLInputElement;
}

function getSaveCustom(): HTMLInputElement {
  return document.querySelector('#saveCustom') as HTMLInputElement;
}

function getCustomCacheHour(): HTMLInputElement {
  return document.querySelector('#cacheHour') as HTMLInputElement;
}

function getCustomFilter(): HTMLTextAreaElement {
  return document.querySelector('#customFilter') as HTMLTextAreaElement;
}

function saveOptions(e: Event): void {
  e.preventDefault();
  const hour: number = Number(getCustomCacheHour().value);
  const customFilter = getCustomFilter().value;
  Settings.save({
    ngUser: getNgUser().value,
    ngCode: getNgCode().value,
    ngKeyword: getNgKeyword().value,
    useCustomFilter: getUseCustom().checked,
    saveCustomNgUser: getSaveCustom().checked,
    customFilter,
    customCacheHour: Number.isNaN(hour) ? -1 : hour,
  });
}

function restoreOptions() {
  Settings.load().then(setOptions, console.error);
}

function resetOptions() {
  setOptions(Settings.getDefault());
}

function setOptions(options: Options) {
  getNgUser().value = options.ngUser;
  getNgCode().value = options.ngCode;
  getNgKeyword().value = options.ngKeyword;
  getUseCustom().checked = options.useCustomFilter;
  getSaveCustom().checked = options.saveCustomNgUser;
  getCustomFilter().value = options.customFilter;
  getCustomCacheHour().value = String(options.customCacheHour);
}

function importOptions() {
  const elm = document.querySelector('#file');
  elm && (elm as HTMLInputElement).click();
}

function fileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  const reader = new FileReader();
  reader.readAsText(files[0]);
  reader.onload = () => {
    const result = reader.result;
    if (typeof result !== 'string') return;
    const obj = JSON.parse(result);
    if (typeof obj !== 'object') return;
    setOptions({...Settings.getDefault(), ...obj});
  };
}

function exportOptions() {
  Settings.load().then((options) => {
    const content = JSON.stringify(options);
    const blob = new Blob([content], {'type': 'text/plain'});
    const url = URL.createObjectURL(blob);
    const elm = document.createElement('a');
    elm.style.display = 'none';
    elm.setAttribute('href', url);
    elm.setAttribute('download', 'options.txt');
    document.body.appendChild(elm);
    elm.click();
    document.body.removeChild(elm);
  }, console.error);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')?.addEventListener('submit', saveOptions);
document.querySelector('#reset')?.addEventListener('click', resetOptions);
document.querySelector('#import')?.addEventListener('click', importOptions);
document.querySelector('#file')?.addEventListener('change', fileChange);
document.querySelector('#export')?.addEventListener('click', exportOptions);

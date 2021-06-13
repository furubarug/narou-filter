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

function getCustomNgUser(): HTMLInputElement {
  return document.querySelector('#customNg') as HTMLInputElement;
}

function getCustomFilter(): HTMLTextAreaElement {
  return document.querySelector('#customFilter') as HTMLTextAreaElement;
}

function saveOptions(e: Event): void {
  e.preventDefault();
  Settings.save({
    ngUser: getNgUser().value,
    ngCode: getNgCode().value,
    ngKeyword: getNgKeyword().value,
    userCustomFilter: getUseCustom().checked,
    saveCustomNgUser: getSaveCustom().checked,
    customNgUser: getCustomNgUser().value,
    customFilter: getCustomFilter().value,
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
  getUseCustom().checked = options.userCustomFilter;
  getSaveCustom().checked = options.saveCustomNgUser;
  getCustomNgUser().value = options.customNgUser;
  getCustomFilter().value = options.customFilter;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')?.addEventListener('submit', saveOptions);
document.querySelector('#reset')?.addEventListener('click', resetOptions);

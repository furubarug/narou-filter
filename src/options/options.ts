import {Settings} from '../scripts/Settings';

function getNgUser(): HTMLInputElement {
  return document.querySelector('#ngUser') as HTMLInputElement;
}

function getNgCode(): HTMLInputElement {
  return document.querySelector('#ngCode') as HTMLInputElement;
}

function getNgKeyword(): HTMLInputElement {
  return document.querySelector('#ngKeyword') as HTMLInputElement;
}

function saveOptions(e: Event): void {
  e.preventDefault();
  Settings.save({
    ngUser: getNgUser().value,
    ngCode: getNgCode().value,
    ngKeyword: getNgKeyword().value,
    userCustomFilter: false,
    customFilter: '',
  });
}

function restoreOptions() {
  Settings.load().then((result) => {
    getNgUser().value = result.ngUser;
    getNgCode().value = result.ngCode;
    getNgKeyword().value = result.ngKeyword;
  }, console.error);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')?.addEventListener('submit', saveOptions);

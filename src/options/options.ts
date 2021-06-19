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
  Settings.load().then((options) => {
    const hour: number = Number(getCustomCacheHour().value);
    const customFilter = getCustomFilter().value;
    const customCache = (options.customFilter === customFilter) ?
      options.customCache : '{}';
    Settings.save({
      ngUser: getNgUser().value,
      ngCode: getNgCode().value,
      ngKeyword: getNgKeyword().value,
      useCustomFilter: getUseCustom().checked,
      saveCustomNgUser: getSaveCustom().checked,
      customFilter,
      customCacheHour: Number.isNaN(hour) ? -1 : hour,
      customCache,
    });
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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')?.addEventListener('submit', saveOptions);
document.querySelector('#reset')?.addEventListener('click', resetOptions);

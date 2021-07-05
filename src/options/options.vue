<template v-if="loaded">
  <label for="ngUser">NGユーザーID</label>
  <input type="text" id="ngUser" v-model="ngUser" placeholder="カンマやスペース区切りのユーザーID">
  <label for="ngCode">NG小説Nコード</label>
  <input type="text" id="ngCode" v-model="ngCode" placeholder="カンマやスペース区切りのNコード">
  <label for="ngKeyword">NGキーワード</label>
  <input type="text" id="ngKeyword" v-model="ngKeyword" placeholder="カンマやスペース区切りのキーワード(完全一致)">

  <custom-filter filter-use-label="カスタムNGユーザーフィルターを使用する" ng-save-label="フィルタ結果をNGユーザーに追加"
                 v-model:use-custom-ng-filter="useCustomNgUserFilter" v-model:save-custom-ng="saveCustomNgUser"
                 v-model:custom-filter="customNgUserFilter"></custom-filter>
  <br>
  <custom-filter filter-use-label="カスタムNG小説フィルターを使用する" ng-save-label="フィルタ結果をNG小説に追加"
                 v-model:use-custom-ng-filter="useCustomNgNovelFilter" v-model:save-custom-ng="saveCustomNgNovel"
                 v-model:custom-filter="customNgNovelFilter"></custom-filter>
  <br>

  <template v-if="useCustomNgUserFilter||useCustomNgNovelFilter">
    <label for="cacheHour">カスタムキャッシュ保持時間</label>
    <input type="number" id="cacheHour" v-model.number="customCacheHour" placeholder="単位はh, 0でキャッシュなし, 負数で永続">
  </template>
  <br>
  <button type="button" class="button button-outline" v-on:click="reset">Reset</button>
  <button type="button" class="button" v-on:click="save">Save</button>
  <div class="float-right">
    <input type="file" ref="file" style="display: none" v-on:change="importOptions">
    <button type="button" class="button button-clear" v-on:click="$refs.file.click">import</button>
    <button type="button" class="button button-clear" v-on:click="exportOptions">export</button>
  </div>
</template>

<script lang="ts">
import {Options, Settings} from '../scripts/Settings';
import CustomFilter from './custom-filter.vue';
import {defineComponent} from 'vue';

export default defineComponent({
  components: {CustomFilter},
  data(): Options & { loaded: boolean } {
    return {
      ngUser: '',
      ngCode: '',
      ngKeyword: '',
      useCustomNgUserFilter: false,
      saveCustomNgUser: true,
      customNgUserFilter: '',
      useCustomNgNovelFilter: false,
      saveCustomNgNovel: true,
      customNgNovelFilter: '',
      customCacheHour: -1,
      loaded: false,
    };
  },
  created() {
    Settings.load().then((options) => {
      this.options = options;
      this.loaded = true;
    });
  },
  methods: {
    reset() {
      this.options = Settings.getDefault();
    },
    save() {
      Settings.save(this.options);
    },
    importOptions(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        const obj = JSON.parse(result);
        if (typeof obj !== 'object') return;
        this.options = {...Settings.getDefault(), ...obj};
      };
    },
    exportOptions() {
      const content = JSON.stringify(this.options);
      const blob = new Blob([content], {'type': 'text/plain'});
      const url = URL.createObjectURL(blob);
      const elm = document.createElement('a');
      elm.style.display = 'none';
      elm.setAttribute('href', url);
      elm.setAttribute('download', 'options.txt');
      document.body.appendChild(elm);
      elm.click();
      document.body.removeChild(elm);
    },
  },
  computed: {
    // FIXME データのあれこれを力技で回避。Proxyをいい感じにして力技をやめたい
    options: {
      get: function(): Options {
        return ({
          ngUser: this.ngUser,
          ngCode: this.ngCode,
          ngKeyword: this.ngKeyword,
          useCustomNgUserFilter: this.useCustomNgUserFilter,
          saveCustomNgUser: this.saveCustomNgUser,
          customNgUserFilter: this.customNgUserFilter,
          useCustomNgNovelFilter: this.useCustomNgNovelFilter,
          saveCustomNgNovel: this.saveCustomNgNovel,
          customNgNovelFilter: this.customNgNovelFilter,
          customCacheHour: this.customCacheHour,
        });
      },
      set: function(options: Options) {
        this.ngUser = options.ngUser;
        this.ngCode = options.ngCode;
        this.ngKeyword = options.ngKeyword;
        this.useCustomNgUserFilter = options.useCustomNgUserFilter;
        this.saveCustomNgUser = options.saveCustomNgUser;
        this.customNgUserFilter = options.customNgUserFilter;
        this.useCustomNgNovelFilter = options.useCustomNgNovelFilter;
        this.saveCustomNgNovel = options.saveCustomNgNovel;
        this.customNgNovelFilter = options.customNgNovelFilter;
        this.customCacheHour = options.customCacheHour;
      },
    },
  },
});
</script>

<template v-if="loaded">
  <div class="field">
    <label class="label">NGユーザーID</label>
    <div class="control">
      <input type="text" class="input" v-model="ngUser" placeholder="カンマやスペース区切りのユーザーID">
    </div>
  </div>
  <div class="field">
    <label class="label">NG小説Nコード</label>
    <div class="control">
      <input type="text" class="input" v-model="ngCode" placeholder="カンマやスペース区切りのNコード">
    </div>
  </div>
  <div class="field">
    <label class="label">NGキーワード</label>
    <div class="control">
      <input type="text" class="input" v-model="ngKeyword" placeholder="カンマやスペース区切りのキーワード(完全一致)">
    </div>
  </div>

  <custom-filter filter-use-label="カスタムNGユーザーフィルターを使用する" ng-save-label="フィルタ結果をNGユーザーに追加"
                 v-model:use-custom-ng-filter="useCustomNgUserFilter" v-model:save-custom-ng="saveCustomNgUser"
                 v-model:custom-filter="customNgUserFilter" v-model:useSimpleFilter="useSimpleUserFilter"
                 v-model:simpleFilter="simpleNgUserFilter"></custom-filter>
  <br>
  <custom-filter filter-use-label="カスタムNG小説フィルターを使用する" ng-save-label="フィルタ結果をNG小説に追加"
                 v-model:use-custom-ng-filter="useCustomNgNovelFilter" v-model:save-custom-ng="saveCustomNgNovel"
                 v-model:custom-filter="customNgNovelFilter" v-model:useSimpleFilter="useSimpleNovelFilter"
                 v-model:simpleFilter="simpleNgNovelFilter"></custom-filter>
  <br>

  <template v-if="useCustomNgUserFilter||useCustomNgNovelFilter">
    <div class="field">
      <label class="label">カスタムキャッシュ保持時間</label>
      <div class="control">
        <input type="number" class="input" v-model.number="customCacheHour" placeholder="単位はh, 0でキャッシュなし, 負数で永続">
      </div>
    </div>
  </template>
  <br>

  <div style="display: flex; justify-content: space-between">
    <div class="field is-grouped">
      <div class="control">
        <button type="button" class="button is-link" v-on:click="save">Save</button>
      </div>
      <div class="control">
        <button type="button" class="button is-link is-light" v-on:click="reset">Reset</button>
      </div>
    </div>
    <div class="field is-grouped">
      <input type="file" ref="file" style="display: none" v-on:change="importOptions">
      <div class="control">
        <button type="button" class="button" v-on:click="$refs.file.click">import</button>
      </div>
      <div class="control">
        <button type="button" class="button" v-on:click="exportOptions">export</button>
      </div>
    </div>
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
      useSimpleUserFilter: true,
      simpleNgUserFilter: [],
      useCustomNgNovelFilter: false,
      saveCustomNgNovel: true,
      customNgNovelFilter: '',
      useSimpleNovelFilter: true,
      simpleNgNovelFilter: [],
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
          useSimpleUserFilter: this.useSimpleUserFilter,
          simpleNgUserFilter: this.simpleNgUserFilter,
          useCustomNgNovelFilter: this.useCustomNgNovelFilter,
          saveCustomNgNovel: this.saveCustomNgNovel,
          customNgNovelFilter: this.customNgNovelFilter,
          useSimpleNovelFilter: this.useSimpleNovelFilter,
          simpleNgNovelFilter: this.simpleNgNovelFilter,
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
        this.useSimpleUserFilter = options.useSimpleUserFilter;
        this.simpleNgUserFilter = options.simpleNgUserFilter;
        this.useCustomNgNovelFilter = options.useCustomNgNovelFilter;
        this.saveCustomNgNovel = options.saveCustomNgNovel;
        this.customNgNovelFilter = options.customNgNovelFilter;
        this.useSimpleNovelFilter = options.useSimpleNovelFilter;
        this.simpleNgNovelFilter = options.simpleNgNovelFilter;
        this.customCacheHour = options.customCacheHour;
      },
    },
  },
});
</script>

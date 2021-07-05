<template>
  <label class="label-inline" for="useCustomNgUser">{{ filterUseLabel }}</label>
  <input type="checkbox" id="useCustomNgUser" v-model="useCustomNgFilterComputed">
  <template v-if="useCustomNgFilterComputed">
    <label class="label-inline" for="saveCustomNgUser">{{ ngSaveLabel }}</label>
    <input type="checkbox" id="saveCustomNgUser" v-model="saveCustomNgComputed">
    <label for="customNgUserFilter">カスタムフィルター（jsによるフィルター。戻り値trueでフィルタする。）</label>
    <textarea id="customNgUserFilter" v-model="customFilterComputed"
              placeholder="引数がuserId（ユーザーID）, ncode（Nコード）, allcount（総小説数）, data（小説情報の配列）の非同期関数"></textarea>
  </template>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    filterUseLabel: String,
    ngSaveLabel: String,

    useCustomNgFilter: Boolean,
    saveCustomNg: Boolean,
    customFilter: String,
  },
  emits: ['update:useCustomNgFilter', 'update:saveCustomNg', 'update:customFilter'],
  computed: {
    useCustomNgFilterComputed: {
      get(): Boolean {
        return this.useCustomNgFilter;
      },
      set(v: Boolean) {
        this.$emit('update:useCustomNgFilter', v);
      },
    },
    saveCustomNgComputed: {
      get(): Boolean {
        return this.saveCustomNg;
      },
      set(v: Boolean) {
        this.$emit('update:saveCustomNg', v);
      },
    },
    customFilterComputed: {
      get(): String {
        return this.customFilter ?? '';
      },
      set(v: String) {
        this.$emit('update:customFilter', v);
      },
    },
  },
});
</script>

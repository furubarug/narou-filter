<template>
  <label class="label-inline" for="useCustomNgUser">{{ filterUseLabel }}</label>
  <input type="checkbox" id="useCustomNgUser" v-model="useCustomNgFilterComputed">
  <template v-if="useCustomNgFilterComputed">
    <label class="label-inline" for="saveCustomNgUser">{{ ngSaveLabel }}</label>
    <input type="checkbox" id="saveCustomNgUser" v-model="saveCustomNgComputed">

    <select v-model="useSimpleFilterComputed">
      <option v-bind:value="true">簡易フィルター</option>
      <option v-bind:value="false">カスタムフィルター</option>
    </select>

    <template v-if="useSimpleFilterComputed">
      <label>簡易フィルター（各数値は https://dev.syosetu.com/man/api/ を参照）</label>
      <pre><code>
      <template v-for="(obj, index) in simpleFilterComputed">
        <span class="float-left">
          <button type="button" class="button button-clear" v-on:click="remove(index)">-</button>
          <select v-model="obj.novelType" style="width: auto">
            <option v-for="item in novelTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
          </select>
          の
          <select v-model="obj.targetType" style="width: auto">
            <option v-for="item in targetTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
          </select>
          <template v-if="obj.novelType!=='this'">
            の
            <select v-model="obj.calcType" style="width: auto">
              <option v-for="item in calcTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
            </select>
          </template>
          が
          <input type="text" v-model="obj.value"  style="width: auto">
          <select v-model="obj.compType" style="width: auto">
            <option v-for="item in compTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
          </select>
        </span>
      </template>
      </code></pre>
      <button type="button" class="button button-outline" v-on:click="add()">+</button>
    </template>

    <template v-else>
      <label for="customNgUserFilter">カスタムフィルター（jsによるフィルター。戻り値trueでフィルタする。）</label>
      <textarea id="customNgUserFilter" v-model="customFilterComputed"
                placeholder="引数がuserId（ユーザーID）, ncode（Nコード）, allcount（総小説数）, data（小説情報の配列）の非同期関数">
      </textarea>
    </template>
  </template>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SimpleFilter} from '../scripts/SettingsUtil';

type Selection<T extends keyof SimpleFilter> = readonly { value: SimpleFilter[T], label: string }[];

export default defineComponent({
  data(): {
    novelTypeLabel: Selection<'novelType'>,
    targetTypeLabel: Selection<'targetType'>,
    calcTypeLabel: Selection<'calcType'>,
    compTypeLabel: Selection<'compType'>,
  } {
    return {
      novelTypeLabel: [
        {value: 'this', label: '小説'},
        {value: 'normal', label: '作者の長編'},
        {value: 'short', label: '作者の短編'},
        {value: 'all', label: '作者の全小説'},
      ],
      targetTypeLabel: [
        {value: 'biggenre', label: '大ジャンル'},
        {value: 'genre', label: 'ジャンル'},
        {value: 'general_firstup', label: '初回掲載日'},
        {value: 'general_lastup', label: '最終掲載日'},
        {value: 'novel_type', label: '小説タイプ'},
        {value: 'end', label: '完結済'},
        {value: 'general_all_no', label: '全掲載部分数'},
        {value: 'length', label: '小説文字数'},
        {value: 'isstop', label: '長期連載停止中'},
        {value: 'fav_novel_cnt', label: 'ブックマーク数 '},
        {value: 'impression_cnt', label: '感想数'},
        {value: 'review_cnt', label: 'レビュー数'},
        {value: 'all_point', label: '評価ポイント'},
        {value: 'all_hyoka_cnt', label: '評価者数'},
        {value: 'novelupdated_at', label: '更新日時'},
      ],
      calcTypeLabel: [
        {value: 'sum', label: '合計'},
        {value: 'avg', label: '平均'},
        {value: 'every', label: 'すべて'},
        {value: 'some', label: 'いずれか'},
      ],
      compTypeLabel: [
        {value: 'equal', label: 'である'},
        {value: 'not', label: 'でない'},
        {value: 'lower', label: 'より小さい'},
        {value: 'higher', label: 'より大きい'},
      ],
    };
  },
  props: {
    filterUseLabel: String,
    ngSaveLabel: String,
    useCustomNgFilter: Boolean,
    saveCustomNg: Boolean,
    customFilter: String,
    useSimpleFilter: Boolean,
    simpleFilter: Array,
  },
  emits: ['update:useCustomNgFilter', 'update:saveCustomNg', 'update:customFilter',
    'update:simpleFilter', 'update:useSimpleFilter'],
  methods: {
    add(): void {
      this.simpleFilterComputed.push({
        novelType: 'this',
        targetType: 'general_lastup',
        calcType: 'every',
        value: '365',
        compType: 'lower',
      });
    },
    remove(index: number): void {
      this.simpleFilterComputed.splice(index, 1);
    },
  },
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
    simpleFilterComputed: {
      get(): SimpleFilter[] {
        return this.simpleFilter as SimpleFilter[];
      },
      set(v: SimpleFilter[]) {
        this.$emit('update:simpleFilter', v);
      },
    },
    useSimpleFilterComputed: {
      get(): Boolean {
        return this.useSimpleFilter;
      },
      set(v: Boolean) {
        this.$emit('update:useSimpleFilter', v);
      },
    },
  },
});
</script>

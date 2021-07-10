<template>
  <label class="checkbox">{{ filterUseLabel }}
    <input type="checkbox" class="checkbox" v-model="useCustomNgFilterComputed">
  </label>
  <template v-if="useCustomNgFilterComputed">
    <label class="checkbox">{{ ngSaveLabel }}
      <input type="checkbox" v-model="saveCustomNgComputed">
    </label>
    <br>
    <div class="select is-small">
      <select v-model="useSimpleFilterComputed">
        <option v-bind:value="true">簡易フィルター</option>
        <option v-bind:value="false">カスタムフィルター</option>
      </select>
    </div>

    <template v-if="useSimpleFilterComputed">
      （各数値は https://dev.syosetu.com/man/api/ を参照）<br><br>

      <nav class="panel">
        <template v-for="(obj, index) in simpleFilterComputed">
          <div class="panel-block">
            <button type="button" class="button is-danger is-outlined is-small" v-on:click="remove(index)">×</button>
            <div class="select is-small">
              <select v-model="obj.novelType">
                <option v-for="item in novelTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
              </select>
            </div>
            の
            <div class="select is-small">
              <select v-model="obj.targetType">
                <option v-for="item in targetTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
              </select>
            </div>
            <template v-if="obj.novelType!=='this'">
              の
              <div class="select is-small">
                <select v-model="obj.calcType">
                  <option v-for="item in calcTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
                </select>
              </div>
            </template>
            が
            <input type="text" class="input is-small" style="width: 100px" v-model="obj.value">
            <div class="select is-small">
              <select v-model="obj.compType">
                <option v-for="item in compTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
              </select>
            </div>
          </div>
        </template>

        <div class="panel-block">
          <button type="button" class="button is-light is-rounded is-small" v-on:click="add()">+</button>
        </div>
      </nav>
    </template>

    <template v-else>
      （jsによるフィルター。戻り値trueでフィルタする。）<br>
      <textarea class="textarea" v-model="customFilterComputed"
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
        {value: 'normal', label: '作者の全長編'},
        {value: 'short', label: '作者の全短編'},
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

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
      （各数値は <a href="https://dev.syosetu.com/man/api/">https://dev.syosetu.com/man/api/</a>> を参照）<br><br>

      <nav class="panel">
        <div class="panel-block">
          <nav class="pagination is-rounded is-small">
            <pagenation v-model:page-no="pageNoComputed" v-bind:page-size="simpleFilterComputed.length"></pagenation>
            <a class="pagination-next" v-on:click="addFilter">フィルターを追加</a>
          </nav>
        </div>
        <template v-if="simpleFilterComputed.length > 0">
          <div class="panel-block">
            フィルターの対象:
            <div class="select is-small">
              <select v-model="simpleFilterComputed[pageNoComputed].novelType">
                <option v-for="item in novelTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
              </select>
            </div>
            <button type="button" class="button is-danger is-small"
                    v-on:click="removeFilter(pageNoComputed)">フィルターを削除する
            </button>
          </div>
          <template v-if="simpleFilterComputed[pageNoComputed].novelType !== 'it'">
            <template v-for="(obj, index) in simpleFilterComputed[pageNoComputed].filters">
              <div class="panel-block">
                <button type="button" class="delete is-danger is-small"
                        v-on:click="removeNovelFilter(pageNoComputed, index)">×
                </button>
                <div class="select is-small">
                  <select v-model="obj.targetType">
                    <option v-for="item in targetTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
                  </select>
                </div>
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
              <button type="button" class="button is-light is-rounded is-small"
                      v-on:click="addNovelFilter(pageNoComputed)">絞り込み条件を追加
              </button>
            </div>
          </template>
          <template v-for="(obj, index) in simpleFilterComputed[pageNoComputed].conditions">
            <div class="panel-block">
              <button type="button" class="delete is-danger is-small"
                      v-on:click="removeCondition(pageNoComputed, index)">×
              </button>
              <div class="select is-small">
                <select v-model="obj.targetType">
                  <option v-for="item in targetTypeLabel" v-bind:value="item.value">{{ item.label }}</option>
                </select>
              </div>
              <template v-if="simpleFilterComputed[pageNoComputed].novelType!=='it'">
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
            <button type="button" class="button is-light is-rounded is-small"
                    v-on:click="addCondition(pageNoComputed)">フィルター条件を追加
            </button>
          </div>
        </template>
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
import {SimpleFilter, SimpleFilterCondition} from '../scripts/SettingsUtil';
import Pagenation from './pagenation.vue';

type Selection<T extends keyof SimpleFilterCondition> = readonly { value: SimpleFilterCondition[T], label: string }[];

export default defineComponent({
  components: {Pagenation},
  data(): {
    novelTypeLabel: readonly { value: SimpleFilter['novelType'], label: string }[],
    targetTypeLabel: Selection<'targetType'>,
    calcTypeLabel: Selection<'calcType'>,
    compTypeLabel: Selection<'compType'>,
    pageNo: number,
  } {
    return {
      novelTypeLabel: [
        {value: 'it', label: '小説'},
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
      pageNo: 0,
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
    addFilter(): void {
      this.simpleFilterComputed.push({
        novelType: 'it',
        filters: [],
        conditions: [],
      });
    },
    removeFilter(filterIndex: number): void {
      this.simpleFilterComputed.splice(filterIndex, 1);
    },
    addNovelFilter(filterIndex: number): void {
      this.simpleFilterComputed[filterIndex].filters.push({
        targetType: 'end',
        value: '1',
        compType: 'equal',
      });
    },
    removeNovelFilter(filterIndex: number, novelFilterIndex: number): void {
      this.simpleFilterComputed[filterIndex].filters.splice(novelFilterIndex, 1);
    },
    addCondition(filterIndex: number): void {
      this.simpleFilterComputed[filterIndex].conditions.push({
        targetType: 'general_lastup',
        calcType: 'every',
        value: '365',
        compType: 'lower',
      });
    },
    removeCondition(filterIndex: number, conditionIndex: number): void {
      this.simpleFilterComputed[filterIndex].conditions.splice(conditionIndex, 1);
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
    pageNoComputed: {
      get(): number {
        return this.simpleFilter == undefined ? 0 : this.pageNo < this.simpleFilter.length ?
            this.pageNo : this.simpleFilter.length - 1;
      },
      set(v: number) {
        this.pageNo = v;
      },
    },
  },
});
</script>

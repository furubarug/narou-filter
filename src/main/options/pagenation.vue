<template>
  <template v-if="pageSize && pageSize > 0">
    <ul class="pagination-list">
      <li v-if="pageNoComputed > 0">
        <a class="pagination-link is-disabled" aria-label="Goto prev page" v-on:click="pageNoComputed -= 1">&lt;</a>
      </li>
      <li><span class="pagination-ellipsis"></span></li>
      <template v-if="pageSize <= 7">
        <page-link v-for="i in pageSize" v-bind:no="i" v-bind:is-current="i - 1 === pageNoComputed"
                   @click-link="pageNoComputed = $event">
        </page-link>
      </template>
      <template v-else-if="pageNoComputed < 3">
        <page-link v-for="i in 3" v-bind:no="i" v-bind:is-current="i - 1 === pageNoComputed"
                   @click-link="pageNoComputed = $event">
        </page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-bind:no="pageSize >> 1" @click-link="pageNoComputed = $event"></page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-bind:no="pageSize" @click-link="pageNoComputed = $event"></page-link>
      </template>
      <template v-else-if="pageSize - pageNoComputed <= 3">
        <page-link v-bind:no="1" @click-link="pageNoComputed = $event"></page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-bind:no="pageSize >> 1" @click-link="pageNoComputed = $event"></page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-for="i in 3" v-bind:no="i + pageSize - 3" v-bind:is-current="i + pageSize - 4 === pageNoComputed"
                   @click-link="pageNoComputed = $event">
        </page-link>
      </template>
      <template v-else>
        <page-link v-bind:no="1" @click-link="pageNoComputed = $event"></page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-bind:no="pageNoComputed" @click-link="pageNoComputed = $event"></page-link>
        <page-link v-bind:no="pageNoComputed + 1" v-bind:is-current="true"
                   @click-link="pageNoComputed = $event"></page-link>
        <page-link v-bind:no="pageNoComputed + 2" @click-link="pageNoComputed = $event"></page-link>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <page-link v-bind:no="pageSize" @click-link="pageNoComputed = $event"></page-link>
      </template>
      <li><span class="pagination-ellipsis"></span></li>
      <li  v-if="pageNoComputed < pageSize - 1">
        <a class="pagination-link is-disabled" aria-label="Goto next page" v-on:click="pageNoComputed += 1">&gt;</a>
      </li>
    </ul>
  </template>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import PageLink from './page-link.vue';

export default defineComponent({
  components: {PageLink},
  props: {
    pageNo: Number,
    pageSize: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:pageNo'],
  computed: {
    pageNoComputed: {
      get(): number {
        return this.pageNo ?? 0;
      },
      set(v: number) {
        this.$emit('update:pageNo', v);
      },
    },
  },
});
</script>

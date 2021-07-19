<template>
  <li>
    <a class="pagination-link" v-bind:aria-label="'Goto page ' + no" v-bind:class="{'is-current': isCurrent}"
       v-on:click="clickLink()">{{ no }}
    </a>
  </li>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    no: {
      type: Number,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    clickLink() {
      this.$emit('clickLink', this.no - 1);
    },
  },
});
</script>

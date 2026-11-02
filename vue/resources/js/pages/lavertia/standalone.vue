<script setup lang="ts">
import LavertiaPage from './page.vue';
import type { LavertiaPayload } from '../../components/lavertia/types';

defineProps<{ lavertia: LavertiaPayload }>();
</script>

<template>
    <LavertiaPage :lavertia="lavertia" />
</template>

<script lang="ts">
    import LavertiaPage from './page.svelte';
    import type { LavertiaPayload } from '../../components/lavertia/types';

    let { lavertia }: { lavertia: LavertiaPayload } = $props();
</script>

<LavertiaPage {lavertia} />

<template>
  <div
    v-if="!isBedrock || bedrockStorage"
    v-roving-tabindex
    role="toolbar"
    aria-orientation="horizontal"
    :aria-label="t('baseSetting.title', 2)"
    class="flex items-center gap-2 select-none"
  >
    <button
      v-if="!isBedrock"
      data-testid="home-screenshots-action"
      v-shared-tooltip="() => t('screenshots.manage')"
      type="button"
      class="frost-action-btn"
      :aria-label="t('screenshots.manage')"
      @click="showScreenshots()"
    >
      <v-icon size="20"> photo_camera </v-icon>
    </button>

    <button
      data-testid="home-log-action"
      v-shared-tooltip="() => isBedrock ? t('instance.openLogFolder') : t('logsCrashes.title')"
      type="button"
      class="frost-action-btn"
      :disabled="isValidating || loadingBedrockStorage"
      :aria-label="isBedrock ? t('instance.openLogFolder') : t('logsCrashes.title')"
      @click="showLogs"
    >
      <v-progress-circular
        v-if="isValidating || loadingBedrockStorage"
        indeterminate
        size="18"
        width="2"
        color="white"
      />
      <v-icon v-else size="20"> visibility </v-icon>
    </button>

    <button
      data-testid="home-folder-action"
      v-shared-tooltip="() => t('instance.showInstance')"
      type="button"
      class="frost-action-btn"
      :disabled="isValidating || loadingBedrockStorage"
      :aria-label="t('instance.showInstance')"
      @click="showInstanceFolder"
    >
      <v-icon size="20"> folder </v-icon>
    </button>

    <router-link
      v-if="!isBedrock"
      to="/base-setting?target=modpack"
      custom
      v-slot="{ navigate }"
    >
      <button
        v-shared-tooltip="() => t('modpack.export')"
        type="button"
        class="frost-action-btn"
        :disabled="isValidating"
        :aria-label="t('modpack.export')"
        @click="navigate"
      >
        <v-icon size="20"> share </v-icon>
      </button>
    </router-link>

    <button
      v-shared-tooltip="() => t('user.accountManager')"
      type="button"
      class="frost-action-btn"
      :aria-label="t('user.accountManager')"
      @click="openUserProfile"
    >
      <v-icon size="20"> person </v-icon>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useService } from "@/composables";
import { kInstance } from "@/composables/instance";
import { kInstances } from "@/composables/instances";
import { vRovingTabindex } from "@/directives/rovingTabindex";
import { vSharedTooltip } from "@/directives/sharedTooltip";
import { injection } from "@/util/inject";
import { BaseServiceKey, BedrockServiceKey, BedrockStoragePaths } from "@xmcl/runtime-api";
import { isBedrockInstance } from "@xmcl/instance";
import { useDialog } from "../composables/dialog";
import { useUserMenuControl } from "@/composables/userMenu";

const { show: showScreenshots } = useDialog('screenshots')
const { path, instance } = injection(kInstance);
const { isValidating } = injection(kInstances);
const isBedrock = computed(() => isBedrockInstance(instance.value));
const { openDirectory } = useService(BaseServiceKey);
const { getStoragePaths } = useService(BedrockServiceKey);
const { show: showLogDialog } = useDialog("log");
const { t } = useI18n();
const userMenu = useUserMenuControl();

function openUserProfile() {
  userMenu.show();
}

const bedrockStorage = ref<BedrockStoragePaths>();
const loadingBedrockStorage = ref(false);

watch(isBedrock, async (bedrock) => {
  bedrockStorage.value = undefined;
  if (!bedrock) return;
  loadingBedrockStorage.value = true;
  try {
    bedrockStorage.value = await getStoragePaths();
  } finally {
    loadingBedrockStorage.value = false;
  }
}, { immediate: true });

function showInstanceFolder() {
  openDirectory(isBedrock.value ? bedrockStorage.value!.dataPath : path.value);
}

function showLogs() {
  if (isBedrock.value) {
    openDirectory(bedrockStorage.value!.logsPath);
    return;
  }
  showLogDialog();
}
</script>

<style scoped>
.frost-action-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  outline: none;
}

.frost-action-btn:hover {
  background: rgba(56, 189, 248, 0.22);
  border-color: rgba(56, 189, 248, 0.65);
  color: #38bdf8;
  transform: translateY(-2px);
  box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3);
}

.frost-action-btn:active {
  transform: translateY(0);
}
</style>

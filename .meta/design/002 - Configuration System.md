# Vocabulary Ruby - Configuration System Design

## 1. Project Overview
This document outlines the implementation of a flexible configuration system for the Vocabulary Ruby userscript. It allows users to manage multiple translation "profiles" (configurations) with their own site rules and dictionary sources.

### Original User Prompt
> 我准备我想在当前项目中添加基于配置的设置：
> - 用户可以添加多个配置，配置可以新建、复制、删除，并且可以通过GM_setValue持久化保存。
> - 配置分为本地和远程两种模式，远程模式可通过链接更新，并且可以追加自定义设置。
> - 每个配置包含两个选项，一个是站点列表，用于决定是否启用，另一个是词典列表，用于构造当前配置的词典。
> - 站点列表由复数个正则表达式组成，用于匹配当前页面地址，决定是否自动启用。
> - 词典列表中的词典分为两种，一种是网络资源，指向一个csv或json地址，另一种是手动填入。
> - 词典csv文件内容分为两列，第一列是原词第二列是翻译。
> - 配置应该支持导入导出（JSON），导出的内容格式应与远程配置相同。

---

## 2. Data Models

### 2.1 Dictionary Source
```typescript
type DictionaryType = 'remote' | 'manual';

interface DictionarySource {
  id: string;
  name: string;
  type: DictionaryType;
  enabled: boolean;
  url?: string;      // Required if type is 'remote'
  content?: string;  // Required if type is 'manual' (Format: CSV)
}
```

### 2.2 User Configuration
```typescript
interface UserConfig {
  id: string;
  name: string;
  mode: 'local' | 'remote';
  remoteUrl?: string;       // URL to fetch remote config from
  siteRegexes: string[];    // Array of regex strings to match current page URL
  dictionaries: DictionarySource[];
  enabled: boolean;         // Global toggle for this specific config
  lastUpdated?: number;     // Timestamp of last remote sync
}
```

### 2.3 Storage Strategy
To ensure performance and overcome storage limits for large configurations and dictionary data, all persistence is handled via the `CompressedStorage` utility:

- **Config Registry:** The primary list of `UserConfig` objects is stored under the key `vr_user_configs`. Data is GZIP-compressed using `fflate` and stored as a Base64 string.
- **Merged Cache:** The resulting merged dictionary for the currently active site is cached under `vocabulary_ruby_dict` to avoid re-parsing on every page load.
- **Settings Metadata:** Simple flags (e.g., `activeConfigId`) are managed via `GM_setValue` or wrapped in a `GlobalSettings` object within `CompressedStorage`.

---

## 3. Core Logic

### 3.1 Profile Lifecycle & Persistence
- **Create:** Initialize with a unique UUID (`crypto.randomUUID()`) and default empty arrays for sites and dictionaries.
- **Copy:** Perform a deep clone of the source `UserConfig`, reset the ID, and update the name (e.g., "Original Name (Copy)").
- **Delete:** Remove the config from the array and update the `vr_user_configs` storage.
- **Persistence Loop:** Any change in the UI (e.g., toggling a dictionary, adding a regex) triggers an asynchronous save to `CompressedStorage`.
- **Remote Sync & Customization:**
  - Remote configurations fetch data from `remoteUrl`.
  - User-added "Custom Settings" (regexes/dictionaries) are saved within the same `UserConfig` object and persist across remote updates.
  - Merging of remote data and local overrides occurs during runtime and is preserved during export.

### 3.2 Site Matching Logic
On page load:
1. Iterate through all `UserConfig` objects.
2. For each config, test `window.location.href` against every regex in `siteRegexes`.
3. If any regex matches, and the config is `enabled`, load the associated dictionaries.
4. If multiple configs match, merge their dictionaries or allow the user to select a priority.

### 3.3 Dictionary Aggregation
1. Fetch all 'remote' dictionaries (CSV/JSON).
2. Parse 'manual' dictionary content (CSV).
3. Combine all entries into a single `Map<string, string>`.
4. Pass this Map to the `createMatcher` function.

### 3.4 Import/Export
- **Export:** Serializes a selected `UserConfig` to a JSON file.
- **Import:** Parses a JSON file, validates the structure, and adds it to the list of configurations.

---

## 4. UI Implementation (Reka-UI)

### 4.1 Config Management View
- A list of all profiles with "Active" indicators.
- Buttons for Create, Copy, Delete, Import, and Export.

### 4.2 Profile Editor
- **General Tab:** Name, Mode (Toggle), Remote URL (if remote).
- **Sites Tab:** List of regex inputs with "Add/Remove" buttons.
- **Dictionaries Tab:** 
  - List of dictionary sources.
  - Form to add new 'remote' (URL) or 'manual' (Textarea) sources.
  - Toggle switches for each source.

---

## 5. Technical Considerations
- **Regex Validation:** Validate user-provided regex strings to prevent script crashes.
- **Async Loading:** Since dictionaries and remote configs are fetched via network, ensure the UI provides loading states and non-blocking background processing.
- **Error Handling:** Gracefully handle network failures for remote resources.
- **Performance:** For large sites, ensure that dictionary merging and matcher creation are optimized (likely using the existing `dawg-search` integration).

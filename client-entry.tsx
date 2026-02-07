import config from './package.json';
import { todayPlugin } from './src/today';
import { Options, Func, ViewOptions } from './types/utils';

declare const growiFacade : any;

const activate = (): void => {
  console.log(`Activating ${config.name} v${config.version}...`);

  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }

  const { optionsGenerators } = growiFacade.markdownRenderer;

  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;

  // For page view
  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions ? originalCustomViewOptions(...args) : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(todayPlugin as any);  // プラグイン追加（表示用）

    console.log('todayPlugin added to view options:', options.remarkPlugins);
    return options;
  };

  // For preview
  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions ? originalCustomPreviewOptions(...args) : optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(todayPlugin as any);  // プラグイン追加（プレビュー用）

    // console.log('todayPlugin added to preview options:', options.remarkPlugins);
    return options;
  };

  console.log(`${config.name} activated.`);
};

const deactivate = (): void => {
};

// register activate
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators[config.name] = {
  activate,
  deactivate,
};

console.log(`${config.name} v${config.version} is loaded.`);
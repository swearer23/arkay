import path from 'path';
export const VALID_MATERIAL_TYPE = ['cp']
export const COMPONENT_DIR_PATH = path.join(process.cwd(), './components');
export const COMPONENT_TEMPLATE_PATH = 'http://git.longhu.net/yangshiwei/vue2-component-template.git'
export const COMPONENT_TEMPLATE_TAG = 'v0.0.7'
export const DEFAULT_GITLAB_HOST = 'http://git.longhu.net'
export const DEFAULT_AKATOSH_HOST = 'http://akatosh.longfor.com'
// TODO: 迁移元数据模板到akatosh
export const ARKAY_META_TEMPLATE = {
  framework: "vue2",
  namespace: "longfor-vue2-sfc",
};
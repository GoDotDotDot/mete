import { isPlainObject } from 'lodash';

/**
 * 删除含有 null 或者 undefined 的字段
 * @param data 要检测的数据
 */
export function deleteNullOrUndefinedField(data: object) {
  return Object.keys(data).reduce((pre, key) => {
    let item = data[key];
    if (isPlainObject(item)) {
      item = deleteNullOrUndefinedField(item);
    }
    if (!(item == null)) {
      pre[key] = item; // eslint-disable-line no-param-reassign
    }
    return pre;
  }, {});
}

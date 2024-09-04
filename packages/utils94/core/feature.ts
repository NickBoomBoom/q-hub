/**
 * 返回对象类型, 首字母大写
 * @param variable any
 * @return String 'Object'|'Boolean'|'Number'|'String'|'Undefined'|'Null'|'Array'|'Function'|'Symbol' | 'Map' | 'Set'
 */
export type VarType = 'Object' | 'Boolean' | 'Number' | 'String' | 'Undefined' | 'Null' | 'Array' | 'Function' | 'Symbol' | 'Map' | 'Set';
export function getVarType(variable: any): VarType {
  const type: string = Object.prototype.toString.call(variable);
  type.match(/\s(\S+)]$/);
  return RegExp.$1 as VarType;
}

/**
 *  等分切割数组
 *
 * @static
 * @param {*} arr 数组
 * @param {*} limit 份数
 * @returns
 */
export function sliceArray(arr: any[], limit: number): any[] {
  let res: any[] = [];
  for (let i = 0; i < arr.length; i += limit) {
    res.push(arr.slice(i, i + limit));
  }
  return res;
}

/**
 * 过滤url search 中的字符串
 * @param url
 * @param keys
 */
export function filterUrlSearch(url: string, keys: string[] = []): string {
  keys.forEach((key) => {
    const reg = new RegExp(`${key}=([^&]*)(&|$)`, 'gi');
    url = url.replace(reg, '');
  });
  return url;
}



/**
 * 图片转化base64
 * @param img 图片dom
 */
export function imageToBase64(img: HTMLElement | any): string {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx: any = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
}

/**
 * 获取图片的base64
 * @param src 图片地址
 */
export function getBase64Img(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let result = '';
    let img = new Image();
    img.crossOrigin = '';
    img.src = src;
    img.onload = () => {
      result = imageToBase64(img);
      resolve(result);
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

/**
 * guid 生成
 * @returns guid
 */
export function guid(): string {
  function S4(): string {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}

/**
 * 数组拍平
 *
 */
export function flatten(arr: any[]): any[] {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * 数据格式化
 * @param data 数据
 * @return parse后的数据
 */
export function jsonParse(data: any): any {
  let res = data;
  try {
    res = JSON.parse(data);
  } catch (err) {}
  return res;
}

/**
 * 将非string类型数据 json化 不然无法存储本地
 * @param data 数据
 * @return 字符串数据
 */
export function toString(data: any): string {
  if (typeof data === 'string') {
    return data;
  } else {
    return JSON.stringify(data);
  }
}

/**
 * 补0操作
 * @param num
 * @return sting
 */
export function fillZero(num: number): string {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

/**
 * 深度克隆
 * @param origin 源数据
 * @param hash WeekMap(optional)
 * @returns 深度克隆对象
 */
export function deepClone(data: any, hash = new WeakMap()): any {
  if (typeof data !== 'object' || data === null) {
    throw new TypeError('传入参数不是对象');
  }
  if (Array.isArray(data)) {
    return data.map((t) => {
      return deepClone(t, hash);
    });
  }
  // 判断传入的待拷贝对象的引用是否存在于hash中
  if (hash.has(data)) {
    return hash.get(data);
  }
  let newData: any = {};
  const dataKeys = Object.keys(data);
  dataKeys.forEach((value) => {
    const currentDataValue = data[value];
    // 基本数据类型的值和函数直接赋值拷贝
    if (typeof currentDataValue !== 'object' || currentDataValue === null) {
      newData[value] = currentDataValue;
    } else if (Array.isArray(currentDataValue)) {
      // 实现数组的深拷贝
      newData[value] = [...currentDataValue];
    } else if (currentDataValue instanceof Set) {
      // 实现set数据的深拷贝
      newData[value] = new Set([...currentDataValue]);
    } else if (currentDataValue instanceof Map) {
      // 实现map数据的深拷贝
      newData[value] = new Map([...currentDataValue]);
    } else {
      // 将这个待拷贝对象的引用存于hash中
      hash.set(data, data);
      // 普通对象则递归赋值
      newData[value] = deepClone(currentDataValue, hash);
    }
  });
  return newData;
}

/**
 * 通过key找值
 * @param obj 数据
 * @param key key ; 支持点语法， 支持数组选择
 * @param isDeepClone boolean 是否支持深度克隆；与传入数据的引用 解耦
 * @return value：any 未找到返回undefined
 */
export function getValueByKey(obj: any, key: string, isDeepClone: boolean = false): any {
  const keys = key.replace(/\[(\d+)\]/g, '.$1').split('.');

  let result = isDeepClone ? deepClone(obj) : obj;
  for (const k of keys) {
    if (result !== null && result !== undefined) {
      result = result[k];
    } else {
      return undefined;
    }
  }

  return result;
}

/**
 * 设置对象的值,直接修改obj的元数据
 * @param obj 数据,也支持Vue的Ref对象 [{value: any, prop: string, [propName: string]: any}]
 * @param source 数据源
 */
export function setValue(
  obj: { value: any; prop: string; [propName: string]: any }[] | { value: any; prop: string; [propName: string]: any },
  source: any
) {
  const targetArray = Array.isArray(obj) ? obj : [obj];

  targetArray.forEach((t) => {
    const { prop } = t;
    t.value = getValueByKey(source, prop);
  });
}

/**
 * 重置对象的值
 *
 * @param obj 要重置的对象
 * @returns 重置后的新对象
 * @description
 * 此函数会创建一个新对象，其结构与输入对象相同，但值被重置：
 * - 数组被重置为空数组
 * - 对象被递归重置
 * - 字符串被重置为空字符串
 * - 其他类型被重置为 undefined
 */

export function resetObject(obj: any): any {
  const res: any = {};
  for (const key in obj) {
    let item = obj[key];
    if (Array.isArray(item)) {
      res[key] = [];
    } else if (typeof item === 'object') {
      res[key] = resetObject(item);
    } else if (typeof item === 'string') {
      res[key] = '';
    } else {
      res[key] = undefined;
    }
  }
  return res;
}

/**
 * 顺序执行队列中的任务,执行完成后tasks将被清空
 *
 * @param tasks 任务数组，每个元素都是一个返回 Promise 的函数
 * @returns Promise<void>
 *
 * @description
 * 此函数会按顺序执行传入的任务数组。
 * 每个任务都会等待前一个任务完成后才开始执行。
 * 如果任何任务抛出错误，后续任务将不会执行，错误会被抛出。
 *
 * @example
 * const tasks = [
 *   async () => { await someAsyncOperation() },
 *   async () => { await anotherAsyncOperation() }
 * ];
 * await executeAsyncQueue(tasks);
 */

export async function executeAsyncQueue(tasks: any[]): Promise<void> {
  while (tasks.length > 0) {
    const t = tasks.shift();
    await t();
  }
}

export const feature = {
  getVarType,
  sliceArray,
  filterUrlSearch,
  getBase64Img,
  imageToBase64,
  guid,
  flatten,
  jsonParse,
  toString,
  fillZero,
  getValueByKey,
  setValue,
  deepClone,
  resetObject,
  executeAsyncQueue
};

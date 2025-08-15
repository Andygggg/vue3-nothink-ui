/**
 * 排序順序類型
 */
export type SortStatus = 'asc' | 'desc' | null

/**
 * 資料類型枚舉
 */
export enum DataType {
  AUTO = 0, // 自動偵測
  STRING = 1, // 字串
  NUMBER = 2, // 數字
  DATE = 3, // 日期
  BOOLEAN = 4, // 布林值
  VERSION = 5, // 版本號
  CHINESE = 6, // 中文排序
  NATURAL = 7, //自然排序(文字+數字)
  IP_ADDRESS = 8, // IP地址
  EMAIL = 9, // 電子郵件
  PHONE = 10, // 電話號碼
  CURRENCY = 11, // 貨幣
  PERCENTAGE = 12, // 百分比
  FILE_SIZE = 13, // 檔案大小
  CUSTOM = 99, // 自定義
}

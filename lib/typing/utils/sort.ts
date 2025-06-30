/**
 * 排序順序類型
 */
export type SortStatus = 'asc' | 'desc' | null

/**
 * 排序事件回調類型
 */
export type SortChangeCallback = (key: string, order: SortStatus) => void

/**
 * 資料類型枚舉
 */
export enum DataType {
  AUTO = 0, // 自動偵測
  STRING = 1, // 字串
  STRING_IGNORE_CASE = 2, // 字串(忽略大小寫)
  NUMBER = 3, // 數字
  DATE = 4, // 日期
  BOOLEAN = 5, // 布林值
  VERSION = 6, // 版本號
  CHINESE = 7, // 中文排序
  IP_ADDRESS = 8, // IP地址
  EMAIL = 9, // 電子郵件
  PHONE = 10, // 電話號碼
  CURRENCY = 11, // 貨幣
  PERCENTAGE = 12, // 百分比
  FILE_SIZE = 13, // 檔案大小
  CUSTOM = 99, // 自定義
}

/**
 * 排序方向枚舉
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

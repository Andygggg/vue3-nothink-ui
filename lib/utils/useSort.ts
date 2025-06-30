import type { SortStatus, SortChangeCallback } from '@lib/typing'
import { DataType, SortOrder } from '@lib/typing'

/**
 * 排序管理器
 */
export class SortManager<T = any> {
  private _sortKey: string = ''
  private _sortOrder: SortStatus = null
  private _originalData: T[] = [] // 保存原始資料
  private _sortData: T[] = []
  private _onSortChange?: SortChangeCallback
  private _typeComparer: TypeComparer<T>

  constructor(data: T[], onSortChange?: SortChangeCallback) {
    this._originalData = [...data]
    this._sortData = [...data]
    this._typeComparer = new TypeComparer<T>(data)
    this._onSortChange = onSortChange
  }

  /**
   * 獲取當前排序順序
   */
  get sortData(): T[] {
    return this._sortData
  }

  get sortInfo(): { key: string; status: SortStatus; data: T[] } {
    return {
      key: this._sortKey,
      status: this._sortOrder,
      data: this._sortData,
    }
  }

  /**
   * 切換排序狀態
   * @param key 排序鍵
   */
  public toggleSort(key: string, type: DataType = DataType.AUTO): T[] {
    if (this._sortKey === key) {
      // 同一個鍵：asc -> desc -> null -> asc
      if (this._sortOrder === 'asc') {
        this.setSortState(key, 'desc', type)
      } else if (this._sortOrder === 'desc') {
        this.resetSort()
      } else {
        this.setSortState(key, 'asc', type)
      }
    } else {
      // 不同鍵：直接設為 asc
      this.setSortState(key, 'asc', type)
    }

    return this._sortData
  }

  /**
   * 設置排序狀態
   */
  private setSortState(key: string, order: SortStatus, type: DataType): void {
    this._sortKey = key
    this._sortOrder = order

    // 執行排序
    this.performSort(key, order, type)
  }

  /**
   * 執行排序邏輯
   */
  private performSort(key: string, order: SortStatus, type: DataType): void {
    if (order === null) {
      this._sortData = [...this._originalData]
    } else {
      // 更新 TypeComparer 的資料和類型
      this._typeComparer.setData(this._originalData)
      this._typeComparer.setDataType(type)

      // 轉換排序順序
      const sortOrder = order === 'asc' ? SortOrder.ASC : SortOrder.DESC

      // 執行排序
      this._sortData = this._typeComparer.sort(key as keyof T, sortOrder)
    }

    // 觸發回調
    this._onSortChange?.(this._sortKey, this._sortOrder)
  }

  /**
   * 重置排序狀態
   */
  private resetSort(): void {
    this._sortKey = ''
    this._sortOrder = null
    this._sortData = [...this._originalData]
    this._onSortChange?.('', null)
  }

  /**
   * 更新原始資料 (會重置排序狀態)
   */
  public updateData(newData: T[]): void {
    this._originalData = [...newData]
    this._typeComparer.setData(newData)

    // 如果目前有排序，重新執行排序
    if (this._sortOrder !== null && this._sortKey) {
      this.performSort(this._sortKey, this._sortOrder, this._typeComparer.getDataType())
    } else {
      this._sortData = [...newData]
      this._onSortChange?.(this._sortKey, this._sortOrder)
    }
  }

  /**
   * 批量排序 (多欄位排序)
   */
  public multiSort(sortConfigs: Array<{ key: string; order: SortStatus; type?: DataType }>): void {
    const validConfigs = sortConfigs
      .filter((config) => config.order !== null)
      .map((config) => ({
        key: config.key as keyof T,
        order: config.order === 'asc' ? SortOrder.ASC : SortOrder.DESC,
        type: config.type || DataType.AUTO,
      }))

    if (validConfigs.length === 0) {
      this.resetSort()
      return
    }

    this._typeComparer.setData(this._originalData)
    this._sortData = this._typeComparer.multiSort(validConfigs)

    // 設置主要排序狀態 (第一個排序條件)
    const primarySort = sortConfigs[0]
    this._sortKey = primarySort.key
    this._sortOrder = primarySort.order

    this._onSortChange?.(this._sortKey, this._sortOrder)
  }

  /**
   * 檢查指定鍵是否正在排序
   */
  public isSorting(key: string, status: string | null): boolean {
    return (this._sortKey === key && this._sortOrder === status) || this._sortKey !== key
  }
}

/**
 * 類型比較器類別
 */
export class TypeComparer<T> {
  private data: T[]
  private dataType: DataType
  private customCompareFn?: (a: T, b: T, key: keyof T) => number

  constructor(
    data: T[],
    dataType: DataType = DataType.AUTO,
    customCompareFn?: (a: T, b: T, key: keyof T) => number,
  ) {
    this.data = [...data]
    this.dataType = dataType
    this.customCompareFn = customCompareFn
  }

  /**
   * 自動偵測資料類型
   */
  private detectDataType<K extends keyof T>(key: K): DataType {
    if (this.data.length === 0) return DataType.STRING

    // 取樣前幾個非空值進行判斷
    const samples = this.data
      .map((item) => item[key])
      .filter((val) => val != null && val !== '')
      .slice(0, 5)

    if (samples.length === 0) return DataType.STRING

    // 數字判斷
    if (samples.every((val) => !isNaN(Number(val)) && !isNaN(parseFloat(String(val))))) {
      return DataType.NUMBER
    }

    // 布林值判斷
    if (samples.every((val) => ['true', 'false', '1', '0'].includes(String(val).toLowerCase()))) {
      return DataType.BOOLEAN
    }

    // 日期判斷
    if (samples.every((val) => !isNaN(Date.parse(String(val))))) {
      return DataType.DATE
    }

    // 版本號判斷
    if (samples.every((val) => /^\d+\.\d+(\.\d+)*/.test(String(val)))) {
      return DataType.VERSION
    }

    // IP地址判斷
    if (samples.every((val) => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(String(val)))) {
      return DataType.IP_ADDRESS
    }

    // 電子郵件判斷
    if (samples.every((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val)))) {
      return DataType.EMAIL
    }

    // 電話號碼判斷
    if (
      samples.every(
        (val) =>
          /^[\d\s\-\+\(\)]+$/.test(String(val)) && String(val).replace(/\D/g, '').length >= 8,
      )
    ) {
      return DataType.PHONE
    }

    // 貨幣判斷
    if (
      samples.every((val) =>
        /^[\$\€\£\¥\₩\NT\$]?[\d,]+(\.\d{2})?$/.test(String(val).replace(/\s/g, '')),
      )
    ) {
      return DataType.CURRENCY
    }

    // 百分比判斷
    if (samples.every((val) => /^\d+(\.\d+)?%$/.test(String(val)))) {
      return DataType.PERCENTAGE
    }

    // 檔案大小判斷
    if (samples.every((val) => /^\d+(\.\d+)?\s*(B|KB|MB|GB|TB)$/i.test(String(val)))) {
      return DataType.FILE_SIZE
    }

    // 中文判斷
    if (samples.some((val) => /[\u4e00-\u9fff]/.test(String(val)))) {
      return DataType.CHINESE
    }

    return DataType.STRING
  }

  /**
   * 獲取對應的比較函數
   */
  private getCompareFunction(type: DataType): (a: T, b: T, key: keyof T) => number {
    switch (type) {
      case DataType.STRING:
        return this.stringCompare.bind(this)

      case DataType.STRING_IGNORE_CASE:
        return this.stringIgnoreCaseCompare.bind(this)

      case DataType.NUMBER:
        return this.numberCompare.bind(this)

      case DataType.DATE:
        return this.dateCompare.bind(this)

      case DataType.BOOLEAN:
        return this.booleanCompare.bind(this)

      case DataType.VERSION:
        return this.versionCompare.bind(this)

      case DataType.CHINESE:
        return this.chineseCompare.bind(this)

      case DataType.IP_ADDRESS:
        return this.ipAddressCompare.bind(this)

      case DataType.EMAIL:
        return this.emailCompare.bind(this)

      case DataType.PHONE:
        return this.phoneCompare.bind(this)

      case DataType.CURRENCY:
        return this.currencyCompare.bind(this)

      case DataType.PERCENTAGE:
        return this.percentageCompare.bind(this)

      case DataType.FILE_SIZE:
        return this.fileSizeCompare.bind(this)

      case DataType.CUSTOM:
        return this.customCompareFn || this.defaultCompare.bind(this)

      default:
        return this.defaultCompare.bind(this)
    }
  }

  /**
   * 主要排序函數
   */
  public sort<K extends keyof T>(key: K, order: SortOrder = SortOrder.ASC): T[] {
    const actualType = this.dataType === DataType.AUTO ? this.detectDataType(key) : this.dataType
    const compareFunction = this.getCompareFunction(actualType)

    return [...this.data].sort((a, b) => {
      const result = compareFunction(a, b, key)
      return order === SortOrder.ASC ? result : -result
    })
  }

  /**
   * 多欄位排序
   */
  public multiSort(sortConfigs: Array<{ key: keyof T; order: SortOrder; type?: DataType }>): T[] {
    return [...this.data].sort((a, b) => {
      for (const config of sortConfigs) {
        const type = config.type || this.detectDataType(config.key)
        const compareFunction = this.getCompareFunction(type)
        const result = compareFunction(a, b, config.key)

        if (result !== 0) {
          return config.order === SortOrder.ASC ? result : -result
        }
      }
      return 0
    })
  }

  // ============ 各種比較函數 ============

  private defaultCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return -1
    if (bVal == null) return 1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal
    }

    if (aVal instanceof Date && bVal instanceof Date) {
      return aVal.getTime() - bVal.getTime()
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return aStr.localeCompare(bStr)
  }

  private stringCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')
    return aVal.localeCompare(bVal)
  }

  private stringIgnoreCaseCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '').toLowerCase()
    const bVal = String(b[key] || '').toLowerCase()
    return aVal.localeCompare(bVal)
  }

  private numberCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = Number(a[key]) || 0
    const bVal = Number(b[key]) || 0
    return aVal - bVal
  }

  private dateCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = new Date(a[key] as any).getTime()
    const bVal = new Date(b[key] as any).getTime()

    if (isNaN(aVal) && isNaN(bVal)) return 0
    if (isNaN(aVal)) return -1
    if (isNaN(bVal)) return 1

    return aVal - bVal
  }

  private booleanCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseBooleanValue(a[key])
    const bVal = this.parseBooleanValue(b[key])
    return Number(aVal) - Number(bVal)
  }

  private parseBooleanValue(value: any): boolean {
    const str = String(value).toLowerCase()
    return ['true', '1', 'yes', 'on', 'enabled'].includes(str)
  }

  private versionCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    const aParts = aVal.split('.').map(Number)
    const bParts = bVal.split('.').map(Number)
    const maxLength = Math.max(aParts.length, bParts.length)

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0
      if (aPart !== bPart) {
        return aPart - bPart
      }
    }
    return 0
  }

  private chineseCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')
    return aVal.localeCompare(bVal, 'zh-TW', { numeric: true })
  }

  private ipAddressCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    const aNum = this.ipToNumber(aVal)
    const bNum = this.ipToNumber(bVal)

    return aNum - bNum
  }

  private ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number)
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  }

  private emailCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '').toLowerCase()
    const bVal = String(b[key] || '').toLowerCase()

    // 先比較域名，再比較用戶名
    const [aUser, aDomain] = aVal.split('@')
    const [bUser, bDomain] = bVal.split('@')

    const domainCompare = (aDomain || '').localeCompare(bDomain || '')
    if (domainCompare !== 0) return domainCompare

    return (aUser || '').localeCompare(bUser || '')
  }

  private phoneCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '').replace(/\D/g, '')
    const bVal = String(b[key] || '').replace(/\D/g, '')
    return aVal.localeCompare(bVal)
  }

  private currencyCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseCurrencyValue(String(a[key] || ''))
    const bVal = this.parseCurrencyValue(String(b[key] || ''))
    return aVal - bVal
  }

  private parseCurrencyValue(value: string): number {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0
  }

  private percentageCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = parseFloat(String(a[key] || '').replace('%', '')) || 0
    const bVal = parseFloat(String(b[key] || '').replace('%', '')) || 0
    return aVal - bVal
  }

  private fileSizeCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseFileSize(String(a[key] || ''))
    const bVal = this.parseFileSize(String(b[key] || ''))
    return aVal - bVal
  }

  private parseFileSize(value: string): number {
    const units: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    }

    const match = value.match(/^([\d.]+)\s*([A-Z]+)$/i)
    if (!match) return 0

    const [, num, unit] = match
    return parseFloat(num) * (units[unit.toUpperCase()] || 1)
  }

  // ============ 工具方法 ============

  /**
   * 取得目前資料
   */
  public getData(): T[] {
    return [...this.data]
  }

  /**
   * 更新資料
   */
  public setData(newData: T[]): void {
    this.data = [...newData]
  }

  /**
   * 取得目前資料類型
   */
  public getDataType(): DataType {
    return this.dataType
  }

  /**
   * 設定資料類型
   */
  public setDataType(type: DataType): void {
    this.dataType = type
  }
}

import type { SortStatus } from '@lib/typing'
import { DataType } from '@lib/typing'

/**
 * 資料排序器
 */
export class DataSorter<T = any> {
  private _sortedData: T[] = [] // 已排序資料
  private _dataKey: string = '' // 當前排序資料key
  private _orderKey: SortStatus = null // 當前排序狀態
  private _originalData: T[] = [] // 保存原始資料
  private _typeComparer: TypeComparer<T> //類型比較器

  constructor(data: T[]) {
    this._originalData = [...data]
    this._sortedData = [...data]
    this._typeComparer = new TypeComparer<T>(data)
  }

  [Symbol.for('nodejs.util.inspect.custom')](): T[] {
    return this._sortedData
  }

  [Symbol.iterator]() {
    return this._sortedData[Symbol.iterator]()
  }

  /**當前排序結果*/
  get sortedData(): T[] {
    return this._sortedData
  }

  /**當前物件資訊*/
  get sortedInfo(): { key: string; status: SortStatus; data: T[] } {
    return {
      key: this._dataKey,
      status: this._orderKey,
      data: this._sortedData,
    }
  }

  /**
   * 設置排序狀態
   * @param key 物件key
   * @param order 排序狀態
   * @param type 資料類型
   */
  public setState(key: string, order: SortStatus, type: DataType = DataType.AUTO): void {
    this._dataKey = key
    this._orderKey = order

    this.performSort(type)
  }

  /**
   * 處理排序
   * @param type 資料類型
   */
  private performSort(type: DataType = DataType.AUTO): void {
    if (this._orderKey === null) {
      this._sortedData = [...this._originalData]
    } else {
      this._sortedData = this._typeComparer.sortData(this._dataKey as keyof T, this._orderKey, type)
    }
  }

  /**重置排序狀態*/
  public resetState() {
    this._dataKey = ''
    this._orderKey = null
    this._sortedData = [...this._originalData]
  }

  /**
   * 更新物件資料
   * @param newData 新資料
   */
  public update(newData: T[]): void {
    this._originalData = [...newData]
    this._typeComparer.setData(newData)

    // 如果目前有排序，重新執行排序
    if (this._orderKey !== null && this._dataKey) {
      this.performSort()
    } else {
      this._sortedData = [...newData]
    }
  }

  /**
   * 切換排序狀態
   * @param key 排序鍵
   * @param type 資料類型
   */
  public toggleSort(key: string, type: DataType = DataType.AUTO): T[] {
    if (this._dataKey === key) {
      switch (this._orderKey) {
        case 'asc':
          this.setState(key, 'desc', type)
          break
        case 'desc':
          this.resetState()
          break
        default:
          this.setState(key, 'asc', type)
          break
      }
    } else {
      this.setState(key, 'asc', type)
    }

    return this._sortedData
  }

  /**
   * 檢查指定鍵是否正在排序
   * @param key 排序鍵
   * @param status 排序狀態
   */
  public isSorting(key: string, status: string | null): boolean {
    return (this._dataKey === key && this._orderKey === status) || this._dataKey !== key
  }
}

/**
 * 類型比較器
 */
export class TypeComparer<T> {
  private data: T[] //當前資料
  private type: DataType | null = null //當前資料類型

  constructor(data: T[]) {
    this.data = [...data]
  }

  /**
   * 自動偵測資料類型
   * @param 物件key
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
    if (samples.every((val) => this.isValidDate(val))) {
      return DataType.DATE
    }

    //自然排序判斷
    if (this.isNaturalSort(samples)) {
      return DataType.NATURAL
    }

    // 中文判斷
    if (samples.some((val) => /[\u4e00-\u9fff]/.test(String(val)))) {
      return DataType.CHINESE
    }

    // 版本號判斷
    if (samples.every((val) => /^\d+\.\d+(\.\d+)*/.test(String(val)))) {
      return DataType.VERSION
    }

    // IP地址判斷
    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/

    if (samples.every((val) => ipv4Regex.test(String(val)))) {
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

    return DataType.STRING
  }

  /**
   * 檢查日期格式
   * @param val 日期
   * @returns
   */
  private isValidDate(val: unknown) {
    const str = String(val).trim()

    // 1. 排除明顯不是日期的格式
    if (str.length < 4) return false

    // 2. 檢查是否包含中文字符
    if (/[\u4e00-\u9fff]/.test(str)) return false

    // 3. 檢查常見日期格式
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
      /^\d{4}\/\d{1,2}\/\d{1,2}$/, // YYYY/MM/DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
    ]

    //4. 尋找是否有匹配的格式
    const hasValidPattern = datePatterns.some((pattern) => pattern.test(str))
    if (!hasValidPattern) return false

    // 5. 最後才用 Date.parse 檢查
    const parsed = Date.parse(str)
    return !isNaN(parsed)
  }

  /**
   * 檢查文字是否符合自排排序格式
   * @param samples 所有樣本
   * @returns
   */
  private isNaturalSort(samples: any[]) {
    const naturalPatterns = [
      /^[a-zA-Z]+\d+/, // 字母開頭+數字：item1, test2, file10
      /^\d+[a-zA-Z]+/, // 數字開頭+字母：1st, 2nd, 3rd
      /^[a-zA-Z]+\d+[a-zA-Z]*/, // 字母+數字+字母：v1beta, test1a
      /^.+\d+.*/, // 任何包含數字的字串：chapter 1, page 10
    ]
    // 1.檢查樣本是否符合正規表達式
    const hasNaturalPattern = samples.some((val) =>
      naturalPatterns.some((pattern) => pattern.test(String(val))),
    )

    //2.進一步檢查是否真的需要自然排序(可能為純文字或純數字)
    if (hasNaturalPattern) {
      const stringifiedSamples = samples.map(String)
      const hasNumbersInStrings = stringifiedSamples.some((str) => /\d/.test(str))
      const hasNonNumbers = stringifiedSamples.some((str) => /[^\d]/.test(str))

      return hasNumbersInStrings && hasNonNumbers
    }
  }

  /**
   * 獲取對應的比較函數
   * @param type 資料類型
   */
  private getCompareFunction(type: DataType): (a: T, b: T, key: keyof T) => number {
    switch (type) {
      case DataType.STRING:
        return this.stringCompare.bind(this)

      case DataType.NUMBER:
        return this.numberCompare.bind(this)

      case DataType.DATE:
        return this.dateCompare.bind(this)

      case DataType.BOOLEAN:
        return this.booleanCompare.bind(this)

      case DataType.NATURAL:
        return this.naturalCompare.bind(this)

      case DataType.CHINESE:
        return this.chineseCompare.bind(this)

      case DataType.VERSION:
        return this.versionCompare.bind(this)

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

      default:
        return this.defaultCompare.bind(this)
    }
  }

  /**
   * 資料排序
   * @param key 物件key
   * @param order 排序狀態
   * @param type 資料類型
   * @returns
   */
  public sortData<K extends keyof T>(
    key: K,
    order: SortStatus,
    type: DataType = DataType.AUTO,
  ): T[] {
    //1.檢查資料類別
    let actualType: DataType = type
    if (actualType === DataType.AUTO || !this.type) {
      actualType = type === DataType.AUTO ? this.detectDataType(key) : type
      this.type = actualType
    }
    //2.綁定對應的比較函式
    const compareFunction = this.getCompareFunction(this.type)

    //3.處理資料比較
    return [...this.data].sort((a, b) => {
      const result = compareFunction(a, b, key)
      return order === 'asc' ? result : -result
    })
  }

  // ============ 各種比較函數 ============

  /**預設比較*/
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

  /**字串比較*/
  private stringCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    //按瀏覽器預設語言去判斷
    return aVal.localeCompare(bVal, undefined, {
      numeric: true, // 數字自然排序
      sensitivity: 'base', // 忽略大小寫和重音符號
    })
  }

  /**數字比較*/
  private numberCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = Number(a[key]) || 0
    const bVal = Number(b[key]) || 0
    return aVal - bVal
  }

  /**日期比較*/
  private dateCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = new Date(a[key] as any).getTime()
    const bVal = new Date(b[key] as any).getTime()

    if (isNaN(aVal) && isNaN(bVal)) return 0
    if (isNaN(aVal)) return -1
    if (isNaN(bVal)) return 1

    return aVal - bVal
  }

  /**布林值比較*/
  private booleanCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseBooleanValue(a[key])
    const bVal = this.parseBooleanValue(b[key])
    return Number(aVal) - Number(bVal)
  }

  /**
   * 將數值解析為布林值
   * @param value 待驗證數值
   * @returns
   */
  private parseBooleanValue(value: any): boolean {
    const str = String(value).toLowerCase()
    return ['true', '1', 'yes', 'on', 'enabled'].includes(str)
  }

  /**自排排序比較*/
  private naturalCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    //1.解析文字格式
    const aParts = this.parseNaturalParts(aVal)
    const bParts = this.parseNaturalParts(bVal)

    //2.計算文字長度
    const maxLength = Math.max(aParts.length, bParts.length)

    //3.逐個比較每個部分
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i]
      const bPart = bParts[i]

      // a.如果其中一個已經結束，較短的排在前面
      if (!aPart) return -1
      if (!bPart) return 1

      // b.如果類型不同，文字優先於數字
      if (aPart.type !== bPart.type) {
        return aPart.type === 'text' ? -1 : 1
      }

      // c.比較相同類型的值
      if (aPart.type === 'number' && bPart.type === 'number') {
        const result = (aPart.value as number) - (bPart.value as number)
        if (result !== 0) return result
      } else {
        const result = String(aPart.value).localeCompare(String(bPart.value), undefined, {
          sensitivity: 'base',
        })
        if (result !== 0) return result
      }
    }

    return 0
  }

  /**
   * 將字串分解為文字和數字部分
   * @param str 字串
   * @returns
   */
  private parseNaturalParts(
    str: string,
  ): Array<{ type: 'text' | 'number'; value: string | number }> {
    const parts: Array<{ type: 'text' | 'number'; value: string | number }> = []
    const regex = /(\d+|\D+)/g
    let match

    while ((match = regex.exec(str)) !== null) {
      const part = match[1]
      if (/^\d+$/.test(part)) {
        parts.push({ type: 'number', value: parseInt(part, 10) })
      } else {
        parts.push({ type: 'text', value: part })
      }
    }

    return parts
  }

  /**中文比較*/
  private chineseCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    // 自動偵測語言環境
    const lang = navigator.language?.toLowerCase() || 'zh-tw'
    let locale = 'zh-TW' // 預設繁體中文

    if (lang.includes('cn') || lang.includes('hans')) {
      locale = 'zh-CN' // 簡體中文
    } else if (lang.includes('hk')) {
      locale = 'zh-HK' // 香港繁體
    }

    return aVal.localeCompare(bVal, locale, { numeric: true })
  }

  /**版本號比較*/
  private versionCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    //1.解析版本號，將其拆解成主版本號、次版本號、細項
    const versionA = this.parseVersion(aVal)
    const versionB = this.parseVersion(bVal)

    //2.針對主版本號、次版本號、細項先進行一次排序
    if (versionA.major !== versionB.major) return versionA.major - versionB.major
    if (versionA.minor !== versionB.minor) return versionA.minor - versionB.minor
    if (versionA.patch !== versionB.patch) return versionA.patch - versionB.patch

    //3.計算文字長度
    const maxExtraLength = Math.max(versionA.extra.length, versionB.extra.length)
    //4.逐個比對
    for (let i = 0; i < maxExtraLength; i++) {
      const aPart = versionA.extra[i] || 0
      const bPart = versionB.extra[i] || 0
      if (aPart !== bPart) return aPart - bPart
    }

    //5.解析版本號是否帶有文字描述
    const aPriorityA = this.parseReleaseVersion(versionA.prerelease)
    const aPriorityB = this.parseReleaseVersion(versionB.prerelease)
    //5.1 比對排序
    if (aPriorityA !== aPriorityB) return aPriorityA - aPriorityB
    //6.處理自然排序
    if (versionA.prerelease && versionB.prerelease) {
      return this.naturalVersionCompare(versionA.prerelease, versionB.prerelease)
    }

    return 0
  }

  /**
   * 拆解版本號
   * @param version 版本號
   * @returns
   */
  private parseVersion(version: string): {
    major: number
    minor: number
    patch: number
    extra: number[]
    prerelease: string
  } {
    const cleaned = version.replace(/^(v|version|ver|r|release)?/i, '')
    const [versionPart] = cleaned.split('+')
    const [corePart, ...prereleaseRaw] = versionPart.split('-')
    const prerelease = prereleaseRaw.join('-')
    const parts = corePart.split('.').map((part) => {
      const num = parseInt(part, 10)
      return isNaN(num) ? 0 : num
    })
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      extra: parts.slice(3),
      prerelease,
    }
  }

  /**
   * 解析發行版本文字
   * @param prerelease 版本號
   * @returns
   */
  private parseReleaseVersion(prerelease: string): number {
    if (!prerelease) return 999 // 正式版本優先級最高

    const lower = prerelease.toLowerCase()
    if (lower.includes('dev')) return 1
    if (lower.includes('alpha')) return 2
    if (lower.includes('beta')) return 3
    if (lower.includes('rc')) return 4
    if (lower.includes('snapshot')) return 5
    return 10 // 其他預發布版本
  }

  /**版本號比較(自然排序)*/
  private naturalVersionCompare(a: string, b: string): number {
    const regex = /(\d+)|(\D+)/g
    const aParts: (string | number)[] = []
    const bParts: (string | number)[] = []

    //1. 將前後版本號拆解出長度
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(a.toLowerCase())) !== null) {
      aParts.push(match[1] ? parseInt(match[1], 10) : match[2])
    }

    regex.lastIndex = 0
    while ((match = regex.exec(b.toLowerCase())) !== null) {
      bParts.push(match[1] ? parseInt(match[1], 10) : match[2])
    }

    //2.計算版本號長度
    const maxLength = Math.max(aParts.length, bParts.length)
    //3.逐個比較
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] ?? ''
      const bPart = bParts[i] ?? ''

      if (typeof aPart === 'number' && typeof bPart === 'number') {
        if (aPart !== bPart) return aPart - bPart
      } else {
        const result = String(aPart).localeCompare(String(bPart))
        if (result !== 0) return result
      }
    }
    return 0
  }

  /**ip比較*/
  private ipAddressCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '')
    const bVal = String(b[key] || '')

    //分解ip各欄位數字
    const ipToNumber = (ip: string) => {
      const parts = ip.split('.').map(Number)
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
    }

    const aNum = ipToNumber(aVal)
    const bNum = ipToNumber(bVal)

    return aNum - bNum
  }

  /**email比較*/
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

  /**手機號碼比較*/
  private phoneCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = String(a[key] || '').replace(/\D/g, '')
    const bVal = String(b[key] || '').replace(/\D/g, '')
    return aVal.localeCompare(bVal)
  }

  /**貨幣比較*/
  private currencyCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseCurrencyValue(String(a[key] || ''))
    const bVal = this.parseCurrencyValue(String(b[key] || ''))
    return aVal - bVal
  }

  /**
   * 分析貨幣類型
   * @param value 貨幣
   * @returns
   */
  private parseCurrencyValue(value: string): number {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0
  }

  /**百分比比較*/
  private percentageCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = parseFloat(String(a[key] || '').replace('%', '')) || 0
    const bVal = parseFloat(String(b[key] || '').replace('%', '')) || 0
    return aVal - bVal
  }

  /**檔案大小比較*/
  private fileSizeCompare<K extends keyof T>(a: T, b: T, key: K): number {
    const aVal = this.parseFileSize(String(a[key] || ''))
    const bVal = this.parseFileSize(String(b[key] || ''))
    return aVal - bVal
  }

  /**
   * 分析檔案單位
   * @param value 檔案單位
   * @returns
   */
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
}

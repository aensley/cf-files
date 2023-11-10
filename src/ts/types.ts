export interface Env {
  FILESR2: R2Bucket
}

export interface FileProperties {
  key: string
  size: number
  uploaded: Date
}

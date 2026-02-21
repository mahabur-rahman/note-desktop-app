interface ZipEntry {
  name: string
  content: Buffer
  isDirectory?: boolean
  modifiedAt?: Date
}

const crc32Table = new Uint32Array(256)

for (let tableIndex = 0; tableIndex < 256; tableIndex += 1) {
  let currentValue = tableIndex
  for (let bitIndex = 0; bitIndex < 8; bitIndex += 1) {
    currentValue = (currentValue & 1) !== 0 ? 0xedb88320 ^ (currentValue >>> 1) : currentValue >>> 1
  }
  crc32Table[tableIndex] = currentValue >>> 0
}

function crc32(contentBuffer: Buffer): number {
  let crc = 0xffffffff
  for (const byte of contentBuffer) {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function getDosDateTime(date: Date): { dosDate: number; dosTime: number } {
  const year = Math.max(1980, date.getFullYear())
  const dosDate = (((year - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f)
  const dosTime =
    ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f)
  return { dosDate, dosTime }
}

export function createZipBuffer(entries: ZipEntry[]): Buffer {
  const normalizedEntries = entries.map((entry) => {
    const normalizedName = entry.isDirectory
      ? entry.name.replace(/\\/g, '/').replace(/\/?$/, '/')
      : entry.name.replace(/\\/g, '/')
    return {
      ...entry,
      name: normalizedName,
      content: entry.isDirectory ? Buffer.alloc(0) : entry.content
    }
  })

  const zipParts: Buffer[] = []
  const centralDirectoryParts: Buffer[] = []
  let localHeaderOffset = 0

  for (const entry of normalizedEntries) {
    const fileNameBuffer = Buffer.from(entry.name, 'utf8')
    const { dosDate, dosTime } = getDosDateTime(entry.modifiedAt ?? new Date())
    const contentCrc32 = entry.isDirectory ? 0 : crc32(entry.content)
    const contentSize = entry.content.length
    const generalPurposeFlag = 0x0800

    const localHeader = Buffer.alloc(30 + fileNameBuffer.length)
    let offset = 0
    localHeader.writeUInt32LE(0x04034b50, offset)
    offset += 4
    localHeader.writeUInt16LE(20, offset)
    offset += 2
    localHeader.writeUInt16LE(generalPurposeFlag, offset)
    offset += 2
    localHeader.writeUInt16LE(0, offset)
    offset += 2
    localHeader.writeUInt16LE(dosTime, offset)
    offset += 2
    localHeader.writeUInt16LE(dosDate, offset)
    offset += 2
    localHeader.writeUInt32LE(contentCrc32, offset)
    offset += 4
    localHeader.writeUInt32LE(contentSize, offset)
    offset += 4
    localHeader.writeUInt32LE(contentSize, offset)
    offset += 4
    localHeader.writeUInt16LE(fileNameBuffer.length, offset)
    offset += 2
    localHeader.writeUInt16LE(0, offset)
    offset += 2
    fileNameBuffer.copy(localHeader, offset)

    const centralHeader = Buffer.alloc(46 + fileNameBuffer.length)
    offset = 0
    centralHeader.writeUInt32LE(0x02014b50, offset)
    offset += 4
    centralHeader.writeUInt16LE(20, offset)
    offset += 2
    centralHeader.writeUInt16LE(20, offset)
    offset += 2
    centralHeader.writeUInt16LE(generalPurposeFlag, offset)
    offset += 2
    centralHeader.writeUInt16LE(0, offset)
    offset += 2
    centralHeader.writeUInt16LE(dosTime, offset)
    offset += 2
    centralHeader.writeUInt16LE(dosDate, offset)
    offset += 2
    centralHeader.writeUInt32LE(contentCrc32, offset)
    offset += 4
    centralHeader.writeUInt32LE(contentSize, offset)
    offset += 4
    centralHeader.writeUInt32LE(contentSize, offset)
    offset += 4
    centralHeader.writeUInt16LE(fileNameBuffer.length, offset)
    offset += 2
    centralHeader.writeUInt16LE(0, offset)
    offset += 2
    centralHeader.writeUInt16LE(0, offset)
    offset += 2
    centralHeader.writeUInt16LE(0, offset)
    offset += 2
    centralHeader.writeUInt16LE(0, offset)
    offset += 2
    centralHeader.writeUInt32LE(entry.isDirectory ? 0x10 : 0, offset)
    offset += 4
    centralHeader.writeUInt32LE(localHeaderOffset, offset)
    offset += 4
    fileNameBuffer.copy(centralHeader, offset)

    zipParts.push(localHeader, entry.content)
    centralDirectoryParts.push(centralHeader)
    localHeaderOffset += localHeader.length + entry.content.length
  }

  const centralDirectory = Buffer.concat(centralDirectoryParts)
  const endOfCentralDirectory = Buffer.alloc(22)
  let endOffset = 0
  endOfCentralDirectory.writeUInt32LE(0x06054b50, endOffset)
  endOffset += 4
  endOfCentralDirectory.writeUInt16LE(0, endOffset)
  endOffset += 2
  endOfCentralDirectory.writeUInt16LE(0, endOffset)
  endOffset += 2
  endOfCentralDirectory.writeUInt16LE(normalizedEntries.length, endOffset)
  endOffset += 2
  endOfCentralDirectory.writeUInt16LE(normalizedEntries.length, endOffset)
  endOffset += 2
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, endOffset)
  endOffset += 4
  endOfCentralDirectory.writeUInt32LE(localHeaderOffset, endOffset)
  endOffset += 4
  endOfCentralDirectory.writeUInt16LE(0, endOffset)

  return Buffer.concat([...zipParts, centralDirectory, endOfCentralDirectory])
}

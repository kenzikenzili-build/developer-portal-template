/**
 * Client-Side Image Compression Utility
 * Compresses uploaded contract images to WebP format under max 300KB.
 */
export async function compressImageToWebP(file: File, maxSizeKB = 300): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    return file // PDFs or non-image files return as is
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Downscale high-resolution mobile photos
        const maxDimension = 1920
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(file)
        }

        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.85
        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file)
              if (blob.size / 1024 <= maxSizeKB || quality <= 0.3) {
                resolve(blob)
              } else {
                quality -= 0.15
                compress()
              }
            },
            'image/webp',
            quality,
          )
        }

        compress()
      }
      img.onerror = () => resolve(file)
      img.src = event.target?.result as string
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

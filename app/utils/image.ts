// Downscale + re-encode a photo as JPEG in the browser before upload. Phone photos are typically
// 3-8MB at 4000px+, far more than a profile picture needs. Falls back to the original file if anything
// goes wrong or the result isn't smaller, so callers can always upload what comes back.
export async function compressImage(
    file: File,
    { maxDimension = 800, quality = 0.75 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

    try {
        // 'from-image' applies EXIF rotation so portrait phone shots aren't saved sideways.
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
        const width = Math.round(bitmap.width * scale)
        const height = Math.round(bitmap.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return file

        // JPEG has no alpha; flatten transparent PNGs onto white instead of black.
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (!blob || blob.size >= file.size) return file

        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
        })
    } catch {
        return file
    }
}

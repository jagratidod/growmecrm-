import { request } from './api'

export const uploadService = {
  async uploadImage(file: File, folder = 'hotels'): Promise<string> {
    const body = new FormData()
    body.set('file', file)
    body.set('folder', `growme_crm/${folder}`)
    const { url } = await request<{ url: string }>('/upload/image', { method: 'POST', body })
    if (!url) throw new Error('The upload did not return an image URL.')
    return url
  },
}

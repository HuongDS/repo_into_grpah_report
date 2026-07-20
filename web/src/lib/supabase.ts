import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadFileToSupabase(file: File) {
  // Tạo tên file duy nhất để không bị trùng
  const fileExt = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`

  const { data, error } = await supabase.storage
    .from('reports')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Lỗi upload Supabase:', error)
    throw new Error('Tải file lên Supabase thất bại. Vui lòng kiểm tra lại cấu hình Bucket.')
  }

  // Lấy Public URL của file
  const { data: publicUrlData } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

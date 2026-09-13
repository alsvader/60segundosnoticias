import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Sale de Draft Mode y vuelve a la experiencia pública normal (§31, AC-PREVIEW-006). */
export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  redirect('/')
}

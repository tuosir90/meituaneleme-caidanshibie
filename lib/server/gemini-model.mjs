export const DEFAULT_YUNWU_MODEL = 'gemini-3-flash-preview'

export function resolveYunwuModel(env = process.env) {
  const model = env.YUNWU_MODEL?.trim()

  if (model) {
    return model
  }

  return DEFAULT_YUNWU_MODEL
}

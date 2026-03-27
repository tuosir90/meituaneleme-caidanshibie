import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_YUNWU_MODEL,
  resolveYunwuModel,
} from '../lib/server/gemini-model.mjs'

test('未配置环境变量时使用默认模型', () => {
  const model = resolveYunwuModel({})

  assert.equal(model, DEFAULT_YUNWU_MODEL)
})

test('配置环境变量时使用指定模型', () => {
  const model = resolveYunwuModel({
    YUNWU_MODEL: 'gemini-2.5-flash',
  })

  assert.equal(model, 'gemini-2.5-flash')
})

test('环境变量为空字符串时回退到默认模型', () => {
  const model = resolveYunwuModel({
    YUNWU_MODEL: '   ',
  })

  assert.equal(model, DEFAULT_YUNWU_MODEL)
})

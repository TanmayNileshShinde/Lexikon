import type { Entry, Form } from './api'

export interface MorphField {
  label: string
  value: string
}

const hasTags = (f: Form, ...tags: string[]) =>
  tags.every((t) => (f.tags ?? []).includes(t))

/**
 * Pull the most useful grammatical row per part of speech out of the raw
 * forms list, e.g. noun -> genitive/plural, verb -> auxiliary/past/participle.
 */
export function morphFields(entry: Entry): MorphField[] {
  const forms = entry.forms ?? []
  const fields: MorphField[] = []

  if (entry.pos === 'noun') {
    const genitive = forms.find(
      (f) => hasTags(f, 'genitive') && !hasTags(f, 'plural'),
    )
    if (genitive) fields.push({ label: 'Genitive', value: genitive.form })

    const plural = entry.plural ?? forms.find((f) => hasTags(f, 'plural'))?.form
    if (plural) fields.push({ label: 'Plural', value: plural })
  } else if (entry.pos === 'verb') {
    if (entry.auxiliary) {
      fields.push({ label: 'Auxiliary', value: entry.auxiliary })
    }

    const present = forms.find((f) =>
      hasTags(f, 'present', 'third-person', 'singular'),
    )
    if (present) fields.push({ label: 'Present (3rd sg.)', value: present.form })

    const past =
      forms.find((f) => hasTags(f, 'preterite')) ??
      forms.find(
        (f) =>
          hasTags(f, 'past') &&
          !hasTags(f, 'subjunctive') &&
          !hasTags(f, 'participle'),
      )
    if (past) fields.push({ label: 'Past tense', value: past.form })

    const participle = forms.find((f) =>
      hasTags(f, 'participle', 'past'),
    )
    if (participle) {
      fields.push({ label: 'Past participle', value: participle.form })
    }
  } else if (entry.pos === 'adj') {
    const comparative = forms.find((f) => hasTags(f, 'comparative'))
    if (comparative) {
      fields.push({ label: 'Comparative', value: comparative.form })
    }

    const superlative = forms.find((f) => hasTags(f, 'superlative'))
    if (superlative) {
      fields.push({ label: 'Superlative', value: superlative.form })
    }
  }

  return fields
}

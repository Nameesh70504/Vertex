import 'server-only'

export const token = process.env.SANITY_API_READ_TOKEN

if (!token && process.env.NODE_ENV === 'production') {
  console.warn(
    'Warning: SANITY_API_READ_TOKEN is not defined in environment variables. If your Sanity dataset is private, queries will fail.'
  )
}


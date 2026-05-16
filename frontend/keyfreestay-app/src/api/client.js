const BASE = '/api'

async function request(method, path, { body, query, multipart } = {}) {
  let url = BASE + path
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString()
    if (qs) url += '?' + qs
  }

  const opts = {
    method,
    credentials: 'include',
    headers: {}
  }
  if (body !== undefined && !multipart) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (multipart) {
    opts.body = body
  }

  const res = await fetch(url, opts)
  if (!res.ok) {
    let msg = res.statusText
    try { msg = (await res.text()) || msg } catch {}
    const err = new Error(msg.trim())
    err.status = res.status
    throw err
  }
  const ct = res.headers.get('Content-Type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  patch: (path, body, query) => request('PATCH', path, { body, query }),
  put: (path, body) => request('PUT', path, { body }),
  del: (path, query) => request('DELETE', path, { query }),
  upload: (path, formData) => request('POST', path, { body: formData, multipart: true })
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/me'),
  updateMe: (data) => api.patch('/me', data),
  logout: () => {
    document.cookie = 'token=; Max-Age=0; Path=/; SameSite=Strict'
  }
}

export const housingApi = {
  list: () => api.get('/housing'),
  get: (id) => api.get(`/housing/${id}`),
  create: (data) => api.post('/housing', data),
  update: (id, data) => api.patch('/housing', data, { id }),
  remove: (id) => api.del('/housing', { id }),
  uploadImages: (id, files) => {
    const fd = new FormData()
    for (const f of files) fd.append('file', f)
    return api.upload(`/housing/${id}/images`, fd)
  },
  removeImage: (id, key) => api.del(`/housing/${id}/images`, { key })
}

export const bookingApi = {
  list: () => api.get('/booking'),
  get: (id) => api.get(`/booking/${id}`),
  create: (data) => api.put('/booking/create', data),
  remove: (id) => api.del(`/booking/${id}`)
}

export const paymentApi = {
  list: () => api.get('/payments'),
  create: (data) => api.put('/payments/create', data),
  remove: (id) => api.del(`/payments/${id}`)
}

export const contactApi = {
  send: (data) => api.post('/contact', data)
}

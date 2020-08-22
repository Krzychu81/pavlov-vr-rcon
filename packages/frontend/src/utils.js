const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

const getUrl = (path) => {
  return `${URL}${path}`
}

const get = (path) => {
  return fetch(getUrl(path))
    .then(response => response.json())
}

const post = (path, body) => {
  return fetch(getUrl(path), {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(response => response.json())
}

const upload = (path, file) => {
  return fetch(getUrl(path), {
    method: 'post',
    body: file,
  })
    .then(response => response.json())
}

const del = (path, body) => {
  return fetch(getUrl(path), {
    method: 'delete',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(response => response.json())
}

const download = (path) => {
  const link = document.createElement("a")
  link.href = getUrl(path)
  link.click()
}

export {
  get,
  post,
  del,
  getUrl,
  download,
  upload,
}

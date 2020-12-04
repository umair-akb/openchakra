export const checkUser = async (name: string) => {
  const response = await fetch('/api/project/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(name),
  })
  const data = await response.json()
  return data
}

export const createProject = async (markup: string, projectName: string) => {
  let bodyData = {
    project: {
      markup: markup,
      projectName: projectName.replace(/\s/g, '').replace(/-/g, ''),
    },
  }
  const response = await fetch('/api/project/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  })
  const data = await response.json()
  const { project } = data
  return project
}
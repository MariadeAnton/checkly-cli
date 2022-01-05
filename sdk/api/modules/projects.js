const PATH = 'projects'

const projects = ({ api, apiVersion = 'next' }) => {
  function getAll () {
    return api.get(`/${apiVersion}/${PATH}`)
  }

  function create (project) {
    return api.post(`/${apiVersion}/${PATH}`, project)
  }

  function deleteProject (id) {
    return api.delete(`/${apiVersion}/${PATH}/${id}?newSync=true`)
  }

  function deploy (resources, { dryRun = false, newSync = true } = {}) {
    return api.post(
      `/${apiVersion}/${PATH}/deploy?dryRun=${dryRun}&newSync=${newSync}`,
      resources
    )
  }

  return {
    getAll,
    create,
    deploy,
    delete: deleteProject
  }
}

module.exports = projects
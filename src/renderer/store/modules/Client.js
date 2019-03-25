const state = {
  client: {}
}

const mutations = {
  setClient (state, newClient) {
    state.client = newClient
  }
}

const actions = {
  newClient ({ commit }, newClient) {
    commit('setClient', newClient)
  }
}

export default {
  state,
  mutations,
  actions
}

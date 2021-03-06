import Vue from "vue";
import axios from "../axios";

import * as types from "../mutation-types";

const state = {
	all: [],
	active: null,
};

const getters = {
	screens: (state) => state.all,
	components: (state) => {
		if (state.all.length === 0) {
			return null;
		}

		return state.all[0].components;
	},
	activeComponent: (state) => {
		if (state.active === null || state.all.length === 0) {
			return null;
		}

		let active = state.all[0].components.find((component) => {
			return component.id === state.active;
		});

		if (active === null) {
			return null;
		}

		return { ...active };
	},
};

const actions = {
	async loadScreens(context) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		await context.dispatch("loadTags");

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/screens`);
			context.commit(types.LOAD_SCREENS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	setActiveComponent(context, id) {
		context.commit(types.SET_ACTIVE_COMPONENT, id);
	},
	async saveComponent(context, component) {
		component = JSON.parse(JSON.stringify(component));

		for (let key of ["position", "size"]) {
			for (let c in component[key]) {
				component[key][c] = Number(component[key][c]);
			}
		}

		for (let attribute of component.attributes) {
			if (attribute.type === "position") {
				attribute.value.x = Number(attribute.value.x);
				attribute.value.y = Number(attribute.value.y);

				attribute.delta.start = Number(attribute.delta.start);
				attribute.delta.end = Number(attribute.delta.end);
			}

			for (let condition of attribute.conditions) {
				if ([true, false].indexOf(condition.value) !== -1) {
					continue;
				}

				if (condition.value === "true" || condition.value === "false") {
					condition.value = condition.value === "true";
				} else if (isNaN(Number(condition.value)) == false) {
					condition.value = Number(condition.value);
				}
			}
		}

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;

			if (component.id === null) {
				let response = await axios.post(`/api/devices/${deviceID}/screens/${state.all[0].id}/components`, component);
				component.id = response.data;
			} else {
				await axios.put(`/api/devices/${deviceID}/screens/${state.all[0].id}/components/${component.id}`, component);
			}

			context.commit(types.SAVE_COMPONENT, component);
		} catch (err) {
			console.log(err);
		}
	},
	async deleteComponent(context, id) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.delete(`/api/devices/${deviceID}/screens/${state.all[0].id}/components/${id}`);
			context.commit(types.DELETE_COMPONENT, id);
		} catch (err) {
			console.log(err);
		}
	},
};

const mutations = {
	[types.LOAD_SCREENS](state, screens) {
		state.all = screens;

		if (screens.length > 0) {
			state.active = screens[0].id;
		}
	},
	[types.SET_ACTIVE_COMPONENT](state, id) {
		state.active = id;
	},
	[types.SAVE_COMPONENT](state, data) {
		let components = state.all[0].components;

		for (let i = 0; i < components.length; i++) {
			let component = components[i];

			if (component.id === data.id) {
				Vue.set(components, i, data);
				return;
			}
		}

		components.push(data);
		state.active = data.id;
	},
	[types.DELETE_COMPONENT](state, id) {
		let components = state.all[0].components;

		for (let i = 0; i < components.length; i++) {
			if (components[i].id === id) {
				components.splice(i, 1);
				break;
			}
		}
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};

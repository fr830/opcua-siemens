<template>
<div id="app">
	<b-navbar toggleable>
		<b-nav-toggle target="navbar-collapse"></b-nav-toggle>
		<b-link class="navbar-brand" to="/">
			<span>OPC UA</span>
		</b-link>
		<b-collapse is-nav id="navbar-collapse">
			<b-nav is-nav-bar>
				<b-nav-item to="/devices">Device: {{ activeDevice.name }}</b-nav-item>
				<b-nav-item to="/tags">Tags</b-nav-item>
				<b-nav-item to="/browse">Browse</b-nav-item>
				<b-nav-item to="/screen">Screen</b-nav-item>
			</b-nav>
			<b-nav is-nav-bar class="ml-auto">
				<b-nav-item-dropdown right>
					<template slot="text">
						<span class="bold">User</span>
					</template>
					<b-dropdown-item @click="logout">Logout</b-dropdown-item>
				</b-nav-item-dropdown>
			</b-nav>
		</b-collapse>
	</b-navbar>
	<div class="container">
		<router-view></router-view>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "app",
	computed: {
		...mapGetters([
			"activeDevice",
		]),
	},
	methods: {
		logout() {
			localStorage.removeItem("token");
			this.$router.push("login");
		},
		...mapActions([
			"loadDevices",
		]),
	},
	created() {
		let token = localStorage.getItem("token");

		if (token === null && this.$route.path !== "/login") {
			this.$router.push("login");
		} else if (token !== null && this.$route.path === "/login") {
			this.$router.push("/");
		}
	},
	mounted() {
		this.loadDevices();
	},
	watch: {
		"$route"() {
			let token = localStorage.getItem("token");

			if (token === null && this.$route.path !== "/login") {
				this.$router.push("login");
			} else if (token !== null && this.$route.path === "/login") {
				this.$router.push("/");
			}
		},
	}
};
</script>

<style>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2C3E50;
}

nav.navbar {
	border-bottom: 1px solid rgba(0, 0, 0, 0.125);
	margin-bottom: 30px;
}

a {
	color: #42B983;
}

a:focus {
	outline: none;
}

th:focus {
	outline: none;
}

.pointer {
	cursor: pointer;
}

.bold {
	font-weight: bold;
}
</style>

<template>
	<div>
		<div class="mb-2 pl-6 text-xs text-gray-400 uppercase tracking-wider">FLynx</div>
		<router-link to="/"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="home" />
			<div> Home </div>
		</router-link>
		<router-link to="/proyectos"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="folder-multiple" />
			<div> Proyectos </div>
		</router-link>
		<router-link to="/industria-comunidad"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="account-group" />
			<div> Industria </div>
		</router-link>

		<div class="mt-4 mb-2 pl-6 text-xs text-gray-400 uppercase tracking-wider">Apps</div>
		<router-link to="/territorial-twin"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="earth" />
			<div> TerritorialTwin </div>
		</router-link>

		<router-link to="/digital-terrain"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="terrain" />
			<div> Digital Terrain </div>
		</router-link>

		<div class="mt-4 mb-2 pl-6 text-xs text-gray-400 uppercase tracking-wider">BIM Tools</div>
		<router-link to="/ifcGame"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="controller" />
			<div> IFC Game </div>
		</router-link>
		<router-link to="/ifcVR"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="virtual-reality" />
			<div> IFC VR </div>
		</router-link>
		<router-link to="/ifcAR"
			class="ml-4 hover:ml-10 w-5/6 text-white hover:text-purple-500 dark:hover:text-blue-500 bg-[#1E293B] p-2 pl-6 transform ease-in-out duration-300 flex flex-row items-center space-x-3">
			<mdicon name="augmented-reality" />
			<div> IFC AR </div>
		</router-link>
	</div>
</template>

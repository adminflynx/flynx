<script>

export default {
	props: {
    title: {
			type: Text,
		},
		description: {
			type: Text,
		}				
	}}

</script>

<template>
	<div class="flex justify-center items-center bg-transparent">
		<!-- Card with fire effect and glossy border -->
		<div class="gloss-card md:w-4/5 xl:w-3/5 min-h-96 max-h-screen">
			<div class="fire-bg w-full h-full text-white rounded-lg">
        <h1 class="font-bold pb-2 sm:font-semibold"> {{ title }} </h1>
				<p> {{description}} </p>
			</div>
		</div>
	</div>
</template>


<style>
		/* Neon fire effect with transparency in the gradient and flicker animation */
    .fire-bg {
      background: linear-gradient(45deg, rgba(128, 0, 128, 0.7), rgba(255, 0, 255, 0.4), rgba(255, 255, 255, 0));
      backdrop-filter: blur(10px);
      position: relative;
      padding: 2rem;
      border-radius: 20px;
      overflow: hidden;
      animation: flicker 3s infinite alternate;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
    }

    /* Flickering animation to simulate fire */
    @keyframes flicker {
      0% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
      100% { filter: brightness(1); }
    }

    /* Glossy transparent white border with 45-degree effect */
    .gloss-card {
      border: 10px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      background-clip: padding-box;
      position: relative;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
    }

    /* Gloss effect on top of the card */
    .gloss-card::before {
      content: '';
      position: absolute;
      top: -50px;
      left: -50px;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 70%);
      transform: rotate(45deg);
      opacity: 0.2;
      pointer-events: none;
    }

</style>

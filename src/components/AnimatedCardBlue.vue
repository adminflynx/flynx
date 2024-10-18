<script>

export default {
	props: {
		description: {
			type: Text,
		}				
	}}

</script>

<template>
	<div class="flex justify-center items-center bg-transparent w-full">
		<!-- Card with fire effect and glossy border -->
		<div class="gloss-card sm:w-96 xl:w-4/5 min-h-96 max-h-screen">
			<div class="fire-bgb w-full h-full text-white rounded-lg">
				<p> {{description}} </p>
			</div>
		</div>
	</div>
</template>


<style>
		/* Neon fire effect with transparency in the gradient and flicker animation */
    .fire-bgb {
      background: linear-gradient(45deg, rgba(0, 109, 164, 0.663), rgba(47, 180, 246, 0.477), rgba(222, 157, 248, 0.244));
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

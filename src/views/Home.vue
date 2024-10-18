<script setup>
import AnimatedCard from '../components/AnimatedCard.vue';
import AnimatedCardBlue from '../components/AnimatedCardBlue.vue';
import AnimatedCardGreen from '../components/AnimatedCardGreen.vue';
</script>

<template>
	<div class="min-h-screen pt-16">
		<div class="text-gray-600 dark:text-white">
			<div class="p-5 text-slate-600 dark:text-cyan-500 text-center text-sm md:text-xl lg:text-2xl">
				<span class="hover:text-blue-500 hover:dark:text-pink-500 text-xl sm:text-2xl my-8 md:text-4xl lg:text-5xl">
					<p class="font-bold sm:font-semibold">
						Fundación Lynx
					</p>
				</span>
				<div class="justify-center items-center my-8">
					<div class="my-8 lg:py-24">
						<AnimatedCard title="Visión" description="FLynx aspira a ser un referente en el sector AECO, impulsando la innovación, la excelencia y el desarrollo sostenible. Nos proyectamos como un socio estratégico en la transformación de la industria, integrando investigación, desarrollo y transferencia tecnológica. Con una sólida base de valores como la integridad, disciplina y respeto, buscamos construir un futuro en el que la construcción sea más eficiente, segura y sostenible, generando un impacto positivo en las comunidades y el entorno, dedicando el excedente de nuestro ejercicio a causas sociales"/>
					</div>
					<div class="my-8 lg:pt-24">
						<AnimatedCard title="Misión" description="En FLynx nos dedicamos a ofrecer soluciones integrales en el sector AECO, abarcando consultoría, construcción y formación. A través de un enfoque innovador y sostenible, buscamos generar un impacto positivo en nuestros clientes y en la sociedad, promoviendo prácticas constructivas responsables. Nos comprometemos a liderar el progreso del sector, anticipando las tendencias futuras y potenciando la colaboración con universidades y actores clave para fomentar el desarrollo de tecnologías avanzadas"/>
					</div>
				</div>

				<div class="flex flex-col justify-center lg:grid lg:grid-cols-5 lg:items-center">
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardBlue description="Formulación, diseño, evaluación y construcción de proyectos con un enfoque en sostenibilidad y eficiencia" />
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardBlue description="Diseño, supervisión y ejecución de proyectos de construcción, implementando soluciones que mejoren la calidad de vida de las comunidades"/>
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardBlue description="Comercialización, importación, exportación y suministro de materiales y equipos para el desarrollo de construcciones sostenibles"/>
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<div class="flex justify-center items-center">
								<button>
									<img class="block h-24 md:h-32 w-auto " src="../assets/logo.png" alt="FLynx logo">
								</button>
							</div>
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardGreen description="Desarrollo de proyectos de infraestructura que promuevan la paz y el desarrollo de comunidades vulnerables"/>
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardGreen description="Investigación, desarrollo e innovación en el sector constructor, facilitando la transferencia tecnológica desde la academia hacia la industria y a la sociedad"/>
					</div>
					<div></div>
					<div class="py-5 lg:py-1">
						<AnimatedCardGreen description="Formación y capacitación de profesionales del sector constructor"/>
					</div>
					<div></div>
				</div>								
			
			</div>

			
			<div>
				
			</div>
		</div>
	</div>
</template>

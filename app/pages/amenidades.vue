<script setup lang="ts">
useHead({ title: 'Amenidades · COW-HUB' })
</script>

<template>
  <div>
    <PageHero eyebrow="Amenidades" image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
      description="Recepción ejecutiva 24/7, internet redundante, barra de café y auditorio para 60 personas. Todo resuelto para que te enfoques en tu negocio.">
      Todo lo que tu empresa necesita<br />para operar sin fricciones.
    </PageHero>

    <div class="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div class="mt-14 reveal">
        <FacilitiesExplorer />
      </div>
    </div>
  </div>
</template>

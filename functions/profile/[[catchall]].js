export async function onRequest(context) {
  return context.env.ASSETS.fetch(
    new Request('/app/index.html', context.request)
  );
}

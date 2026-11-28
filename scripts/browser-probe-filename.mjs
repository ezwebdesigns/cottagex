async (page) => {
  return { title: await page.title(), url: page.url() };
}
